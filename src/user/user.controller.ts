import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Put,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import { Request, Response } from "express";
import { AuthCompose, User } from "src/common/decorators";
import { UserKeysType } from "src/DB/models";
import { UserService } from "./user.service";
import { ChangePasswordDto, UpdateProfileDto } from "./DTO/user.dto";
import { UserRole } from "src/common/types";

@Controller("/user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me")
  @AuthCompose()
  async me(@User() user: UserKeysType, @Res() res: Response) {
    const result = await this.userService.meService(user);

    return res.status(HttpStatus.OK).json(result);
  }

  @Put("update-profile")
  @AuthCompose()
  async updateProfile(
    @User("_id") userId: string,
    @Body() body: UpdateProfileDto,
    @Res() res: Response,
  ) {
    const result = await this.userService.updateProfileService(userId, body);
    return res.status(HttpStatus.OK).json(result);
  }

  @Patch("update-password")
  @AuthCompose()
  async changePassword(
    @User("_id") userId: string,
    @Body() body: ChangePasswordDto,
    @Res() res: Response,
  ) {
    const result = await this.userService.changePasswordService(userId, body);
    return res.status(HttpStatus.OK).json(result);
  }

  @Get("")
  @AuthCompose([UserRole.ADMIN])
  async getAll(@Res() res: Response, @Req() req: Request) {
    const result = await this.userService.getAllService(req["parsedQuery"]);
    return res.status(HttpStatus.OK).json(result);
  }

  @Get("/:userId")
  @AuthCompose([UserRole.ADMIN])
  async getOne(@Res() res: Response, @Param("userId") userId: string) {
    const result = await this.userService.getOneService(userId);
    return res.status(HttpStatus.OK).json(result);
  }

  @Delete("/:userId")
  @AuthCompose([UserRole.ADMIN])
  async deleteOne(@Res() res: Response, @Param("userId") userId: string) {
    const result = await this.userService.deleteOneService(userId);
    return res.status(HttpStatus.OK).json(result);
  }
}
