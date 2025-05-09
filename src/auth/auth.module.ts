import { Module } from "@nestjs/common";
import { OTPModel, UserModel } from "../DB/models";
import { UserRepository } from "../DB/repositories/user.repository";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TokenService } from "src/common/services";
import { JwtService } from "@nestjs/jwt";
import { OtpRepository, RevokedTokenRepository } from "src/DB/repositories";
import { RevokedTokenModel } from "src/DB/models/revokedToken.model";

@Module({
  imports: [UserModel, OTPModel, RevokedTokenModel],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    TokenService,
    JwtService,
    OtpRepository,
    RevokedTokenRepository,
  ],
})
export class AuthModule {}
