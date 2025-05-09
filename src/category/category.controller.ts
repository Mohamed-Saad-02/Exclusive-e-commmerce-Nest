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
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { AuthCompose, User } from "src/common/decorators";
import { UserRole } from "src/common/types";
import { UploadFileOptions } from "src/common/utils";
import { ImageAllowedTypes } from "src/constants/constants";
import { CreateCategoryDto, UpdateCategoryDto } from "./DTO/category.dto";
import { CategoryService } from "./category.service";

@Controller("category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @AuthCompose([UserRole.ADMIN])
  @UseInterceptors(FileInterceptor("image", UploadFileOptions({})))
  async createCategory(
    @Body() body: CreateCategoryDto,
    @User("_id") userId: string,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.categoryService.createCategory({
      name: body.name,
      userId,
      image: image,
    });
  }

  @Put(":categoryId")
  @AuthCompose([UserRole.ADMIN])
  @UseInterceptors(
    FileInterceptor(
      "image",
      UploadFileOptions({ allowedFileTypes: ImageAllowedTypes }),
    ),
  )
  async updateCategory(
    @Param("categoryId") categoryId: string,
    @Body() body: UpdateCategoryDto,
    @User("_id") userId: string,
    @Res() res: Response,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const result = await this.categoryService.updateCategory({
      name: body.name,
      image,
      userId,
      categoryId,
    });

    return res.status(HttpStatus.OK).json(result);
  }

  @Get()
  async getCategories() {
    return this.categoryService.getCategories();
  }

  @Get(":categoryId")
  async getCategory(
    @Param("categoryId") categoryId: string,
    @Res() res: Response,
  ) {
    const result = await this.categoryService.getCategory(categoryId);

    return res.status(HttpStatus.OK).json(result);
  }

  @Delete(":categoryId")
  @AuthCompose([UserRole.ADMIN])
  async deleteCategory(
    @Param("categoryId") categoryId: string,
    @Res() res: Response,
  ) {
    const result = await this.categoryService.deleteCategory(categoryId);
    return res.status(HttpStatus.OK).json(result);
  }
}
