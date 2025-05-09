import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import {
  ConfirmEmailDto,
  ForgetPasswordDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
} from "./DTO/auth.dto";

import { JwtPayload } from "jsonwebtoken";
import { AuthCompose, User } from "src/common/decorators";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async signup(@Body() body: SignUpDto) {
    const result = await this.authService.signupService(body);
    return result;
  }

  @Post("signin")
  async signin(@Body() body: SignInDto, @Res() res: Response) {
    const result = await this.authService.signinService(body);
    return res.status(HttpStatus.OK).json(result);
  }

  @Get("logout")
  @AuthCompose()
  async logout(
    @User("_id") userId: string,
    @User("token") token: JwtPayload,
    @Res() res: Response,
  ) {
    const result = await this.authService.logoutService(
      userId,
      token.jti as string,
    );
    return res.status(HttpStatus.OK).json(result);
  }

  @Patch("confirm-email")
  async confirmEmail(@Body() body: ConfirmEmailDto) {
    const result = await this.authService.confirmEmailService(body);
    return result;
  }

  @Get("refresh-token")
  @AuthCompose()
  async refreshToken(
    @User("_id") userId: string,
    @User("token") token: JwtPayload,
    @Res() res: Response,
  ) {
    const result = await this.authService.refreshTokenService(
      userId,
      token.iat as number,
    );
    return res.status(HttpStatus.OK).json(result);
  }

  @Post("forget-password")
  async forgetPassword(@Body() body: ForgetPasswordDto, @Res() res: Response) {
    const result = await this.authService.forgetPasswordService(body.email);
    return res.status(HttpStatus.OK).json(result);
  }

  @Post("reset-password")
  async resetPassword(@Body() body: ResetPasswordDto, @Res() res: Response) {
    const result = await this.authService.resetPasswordService(body);
    return res.status(HttpStatus.OK).json(result);
  }
}
