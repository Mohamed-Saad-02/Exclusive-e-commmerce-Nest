import { Module } from "@nestjs/common";
import { CategoryModel, ProductModel } from "src/DB/models";
import { CategoryRepository, ProductRepository } from "src/DB/repositories";
import { CategoryController } from "./category.controller";
import { CategoryService } from "./category.service";
import { ConstantsService, UploadCloudFileService } from "src/common/services";

@Module({
  imports: [CategoryModel, ProductModel],
  controllers: [CategoryController],
  providers: [
    CategoryService,
    CategoryRepository,
    UploadCloudFileService,
    ProductRepository,
    ConstantsService,
  ],
})
export class CategoryModule {}
