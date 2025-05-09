import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { SendMailOptions } from "nodemailer";
import {
  OtpRepository,
  RevokedTokenRepository,
  UserRepository,
} from "src/DB/repositories";
import { CompareHashed } from "src/common/security";
import { TokenService } from "src/common/services";
import { OTPType } from "src/common/types";
import { sendEmail } from "src/common/utils";
import { v4 as uuidv4 } from "uuid";
import {
  ConfirmEmailDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
} from "./DTO/auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
    private readonly revokedTokenRepository: RevokedTokenRepository,
    private readonly tokenService: TokenService,
  ) {}

  async signupService(body: SignUpDto) {
    const { email } = body;

    // Check if user already exists
    const user = await this.userRepository.findByEmail(email);
    if (user) throw new ConflictException("User already exists");

    // New user
    const newUser = await this.userRepository.create(body);

    // Send email to user for verification if new user is created and save otp to db
    if (newUser) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const mailOptions: SendMailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to our app",
        text: `Your OTP is ${otp}`,
      };

      sendEmail(mailOptions);

      await this.otpRepository.createOtp({
        otp,
        userId: newUser._id.toString(),
        otpType: OTPType.VERIFY_EMAIL,
      });
    }

    // Return user
    return {
      message: "Please Confirm Your Email with OTP that sent to your email",
    };
  }

  async signinService(body: SignInDto) {
    const { email, password } = body;

    const user = await this.userRepository.findByEmail(email, [
      "+password",
      "+isVerified",
    ]);
    if (!user)
      throw new UnauthorizedException("Invalid credentials Or User not found");

    if (!user.isVerified)
      throw new UnauthorizedException("Please verify your email");

    const isPasswordValid = CompareHashed(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException("Invalid credentials");

    const payload = {
      _id: user._id,
      email: user.email,
    };

    const accessToken = this.tokenService.generateToken(payload, {
      secret: process.env.ACCESS_TOKEN,
      expiresIn: "1h",
      jwtid: uuidv4(),
    });

    const refreshToken = this.tokenService.generateToken(payload, {
      secret: process.env.REFRESH_TOKEN,
      expiresIn: "7d",
      jwtid: uuidv4(),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async confirmEmailService(body: ConfirmEmailDto) {
    const { email, otp: userOtp } = body;

    // Check if user exists
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new NotFoundException("User not found");

    // Check if user is already verified
    if (user.isVerified) throw new BadRequestException("User already verified");

    // Check if otp exists
    const otp = await this.otpRepository.findOne({
      filters: {
        userId: user._id.toString(),
        otpType: OTPType.VERIFY_EMAIL,
        expiredAt: { $gte: new Date() },
      },
    });

    if (!otp) throw new NotFoundException("OTP not found or expired");

    // Check if otp is valid
    const isOtpValid = CompareHashed(userOtp, otp.otp);
    if (!isOtpValid) throw new BadRequestException("Invalid OTP");

    // Update user as verified
    await this.userRepository.updateOne({
      filters: { _id: user._id },
      data: { isVerified: true },
    });

    // Delete otp
    await this.otpRepository.deleteOne({
      filters: { _id: otp._id },
    });

    // Return user
    return {
      message: "Email verified successfully",
    };
  }

  async logoutService(userId: string, tokenId: string) {
    await this.revokedTokenRepository.create({
      tokenId,
      userId,
    });

    // Return success message
    return {
      message: "Logged out successfully",
    };
  }

  async refreshTokenService(userId: string, JWTTimestamp: number) {
    const user = await this.userRepository.findOne({
      filters: { _id: userId, isVerified: true, isDeleted: false },
    });

    // If the user is not found, throw an error
    if (!user) throw new NotFoundException("User not found");

    // Generate a new access token
    const payload = {
      _id: user._id,
      email: user.email,
    };

    const accessToken = this.tokenService.generateToken(payload, {
      secret: process.env.ACCESS_TOKEN,
      expiresIn: "1h",
      jwtid: uuidv4(),
    });

    // Return the new access token
    return { accessToken };
  }

  async forgetPasswordService(email: string) {
    const user = await this.userRepository.findOne({
      filters: { email, isDeleted: false, isVerified: true },
    });

    if (!user) throw new NotFoundException("User not found");

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Send OTP to user
    const mailOptions: SendMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password",
      text: `Your OTP is ${otp}`,
    };

    sendEmail(mailOptions);

    // Save OTP to database
    await this.otpRepository.createOtp({
      otp,
      userId: user._id.toString(),
      otpType: OTPType.FORGET_PASSWORD,
      expiredAt: new Date(Date.now() + 1000 * 60 * 10), // 10m,
    });

    // Return success message
    return {
      message: "OTP sent successfully",
    };
  }

  async resetPasswordService(body: ResetPasswordDto) {
    const { email, otp: userOtp, password } = body;

    const user = await this.userRepository.findOne({
      filters: { email, isDeleted: false, isVerified: true },
    });

    if (!user) throw new NotFoundException("User not found");

    // Check if otp exists
    const otp = await this.otpRepository.findOne({
      filters: {
        userId: user._id.toString(),
        otpType: OTPType.FORGET_PASSWORD,
        expiredAt: { $gte: new Date() },
      },
    });

    if (!otp) throw new NotFoundException("OTP not found or expired");

    // Check if otp is valid
    const isOtpValid = CompareHashed(userOtp, otp.otp);
    if (!isOtpValid) throw new BadRequestException("Invalid OTP");

    // Update user password
    user.password = password;
    await this.userRepository.save(user);

    // Delete otp
    await this.otpRepository.deleteOne({
      filters: { _id: otp._id },
    });

    // Return success message
    return {
      message: "Password reset successfully",
    };
  }
}
