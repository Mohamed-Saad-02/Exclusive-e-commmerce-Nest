import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { TokenService } from "../services";
import { RevokedTokenRepository, UserRepository } from "src/DB/repositories";
import { ChangedPassword } from "../security";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
    private readonly revokedTokenRepository: RevokedTokenRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Get the request object from the context
      const request = context.switchToHttp().getRequest();

      // Get the token from the request headers
      const token = request.headers.authorization?.split?.(" ")?.[1];
      if (!token) throw new UnauthorizedException("Token is required");

      // Verify the token
      const decoded = this.tokenService.verifyToken(token, {
        secret: process.env.ACCESS_TOKEN,
      });
      if (!decoded) throw new UnauthorizedException("Invalid token");

      // Check if the token is revoked
      const isRevoked = await this.revokedTokenRepository.findOne({
        filters: { tokenId: decoded.jti },
      });
      if (isRevoked)
        throw new UnauthorizedException("Session expired, please login again");

      // Find the user by the decoded token
      const user = await this.userRepository.findOne({
        filters: { _id: decoded._id, isVerified: true, isDeleted: false },
        select: ["+role"],
      });

      // If the user is not found, throw an error
      if (!user) throw new NotFoundException("User not found");

      // Check if password change
      const isChanged = ChangedPassword(user.changePasswordAt, decoded.iat);

      if (isChanged)
        throw new BadRequestException("Password changed Please Login again");

      // Set the user in the request object
      request.authUser = { user, token: decoded };

      // Return true if the user is found
      return true;
    } catch (error) {
      console.log("AuthGuard error", error);

      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(error.message);
    }
  }
}
