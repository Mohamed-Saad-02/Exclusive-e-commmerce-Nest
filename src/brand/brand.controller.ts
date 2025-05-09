import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { BrandService } from "./brand.service";
import { AuthCompose, User } from "src/common/decorators";
import { UserRole } from "src/common/types";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadFileOptions } from "src/common/utils";
import { CreateBrandDTO, UpdateBrandDTO } from "./DTO/Brand.dto";
import { Response } from "express";

@Controller("brand")
export class BrandController {
  constructor(private readonly BrandService: BrandService) {}

  @Get()
  async getAllBrands() {
    return await this.BrandService.getAllService();
  }

  @Get("/:brandId")
  async getBrand(@Param("brandId") brandId: string) {
    return await this.BrandService.getOneService(brandId);
  }

  @Post()
  @AuthCompose([UserRole.ADMIN])
  @UseInterceptors(FileInterceptor("logo", UploadFileOptions({})))
  async createBrand(
    @Body() body: CreateBrandDTO,
    @User("_id") userId: string,
    @UploadedFile() logo: Express.Multer.File,
  ) {
    return await this.BrandService.createBrandService({
      ...body,
      logo,
      userId,
    });
  }

  @Delete("/:brandId")
  @AuthCompose([UserRole.ADMIN])
  async deleteBrand(
    @User("_id") userId: string,
    @Param("brandId") brandId: string,
  ) {
    return await this.BrandService.deleteBrand(userId, brandId);
  }

  @Put("/:brandId")
  @AuthCompose([UserRole.ADMIN])
  @UseInterceptors(FileInterceptor("logo", UploadFileOptions({})))
  async updateBrand(
    @User("_id") userId: string,
    @Body() body: UpdateBrandDTO,
    @Res() res: Response,
    @Param("brandId") brandId: string,
    @UploadedFile() logo: Express.Multer.File,
  ) {
    const result = await this.BrandService.updateBrand({
      userId,
      ...body,
      brandId,
      logo,
    });

    res.status(HttpStatus.OK).json(result);
  }
}
