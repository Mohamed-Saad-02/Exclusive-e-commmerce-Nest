import { Module } from "@nestjs/common";
import { UserModel } from "src/DB/models";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  imports: [UserModel],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
