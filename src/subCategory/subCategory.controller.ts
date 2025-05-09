import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request, Response } from "express";
import { Types } from "mongoose";
import { AuthCompose, User } from "src/common/decorators";
import { UserRole } from "src/common/types";
import { UploadFileOptions } from "src/common/utils";
import {
  createSubCategoryDTO,
  UpdateSubCategoryDTO,
} from "./DTO/subCategory.dto";
import { SubCategoryService } from "./subCategory.service";

@Controller("sub-category")
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  @Get()
  async getAll(@Res() res: Response, @Req() req: Request) {
    const result = await this.subCategoryService.getAllService(
      req["parsedQuery"],
    );
    res.status(HttpStatus.OK).json(result);
  }

  @Post()
  @AuthCompose([UserRole.ADMIN])
  @UseInterceptors(FileInterceptor("image", UploadFileOptions({})))
  async createOne(
    @Body() body: createSubCategoryDTO,
    @Res() res: Response,
    @User("_id") userId: string,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const result = await this.subCategoryService.createOneService({
      userId,
      ...body,
      image,
    });
    return res.status(HttpStatus.CREATED).json(result);
  }

  @Put("/:subCategoryId")
  @AuthCompose([UserRole.ADMIN])
  @UseInterceptors(FileInterceptor("image", UploadFileOptions({})))
  async updateOne(
    @Body() body: UpdateSubCategoryDTO,
    @Res() res: Response,
    @User("_id") userId: string,
    @Param("subCategoryId") subCategoryId: string,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const result = await this.subCategoryService.updateOneService({
      userId,
      ...body,
      image,
      subCategoryId,
    });
    return res.status(HttpStatus.CREATED).json(result);
  }

  @Get("/:subCategoryId")
  async getSubCategory(
    @Res() res: Response,
    @Param("subCategoryId") subCategoryId: string,
  ) {
    const result = await this.subCategoryService.getOneService(subCategoryId);
    res.status(HttpStatus.OK).json(result);
  }

  @Delete("/:subCategoryId")
  async deleteSubCategory(
    @Res() res: Response,
    @Param("subCategoryId") subCategoryId: string,
  ) {
    const result =
      await this.subCategoryService.deleteOneService(subCategoryId);
    res.status(HttpStatus.OK).json(result);
  }
}
