import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Res,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from "@nestjs/common";
import { BannerService } from "./banner.service";
import { AuthCompose, User } from "src/common/decorators";
import { UserRole } from "src/common/types";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadFileOptions } from "src/common/utils";
import { CreateBannerDTO, UpdateBannerDTO } from "./DTO/banner.dto";
import { Response } from "express";
import { IdParamDTO } from "src/common/DTO/param.dto";

@Controller("banner")
export class BannerController {
  constructor(private readonly BannerService: BannerService) {}

  @Get()
  async getAllBanners() {
    return await this.BannerService.getAll();
  }

  @Get("/:bannerId")
  async getBannerById(@Param("bannerId") bannerId: string) {
    return await this.BannerService.getOne(bannerId);
  }

  @Post()
  @AuthCompose([UserRole.ADMIN])
  @UseInterceptors(FileInterceptor("img", UploadFileOptions({})))
  async createBanner(
    @Body() body: CreateBannerDTO,
    @User("_id") userId: string,
    @UploadedFile() img: Express.Multer.File,
  ) {
    return await this.BannerService.create({
      ...body,
      userId,
      img,
    });
  }

  @Patch("/:id")
  @AuthCompose([UserRole.ADMIN])
  async updateBannerStatus(
    @Param(ValidationPipe) params: IdParamDTO,
    @Body() body: UpdateBannerDTO,
    @Res() res: Response,
  ) {
    const result = await this.BannerService.update({
      ...body,
      bannerId: params.id,
    });
    return res.status(HttpStatus.OK).json(result);
  }

  @Delete("/:bannerId")
  @AuthCompose([UserRole.ADMIN])
  async deleteBanner(
    @Param("bannerId") bannerId: string,
    @Res() res: Response,
  ) {
    const result = await this.BannerService.delete(bannerId);
    return res.status(HttpStatus.OK).json(result);
  }
}
