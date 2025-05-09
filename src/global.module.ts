import { Global, Module } from "@nestjs/common";
import { UserModel } from "src/DB/models";
import { RevokedTokenModel } from "./DB/models/revokedToken.model";
import { RevokedTokenRepository, UserRepository } from "./DB/repositories";
import { TokenService } from "./common/services";
import { JwtService } from "@nestjs/jwt";

@Global()
@Module({
  imports: [UserModel, RevokedTokenModel],
  controllers: [],
  providers: [UserRepository, RevokedTokenRepository, TokenService, JwtService],
  exports: [
    UserRepository,
    RevokedTokenRepository,
    TokenService,
    JwtService,
    UserModel,
    RevokedTokenModel,
  ],
})
export class GlobalModule {}
