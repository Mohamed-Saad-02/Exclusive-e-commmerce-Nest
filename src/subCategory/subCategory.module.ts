import { Module } from "@nestjs/common";
import { CategoryModel, ProductModel, SubCategoryModel } from "src/DB/models";
import { SubCategoryController } from "./subCategory.controller";
import { SubCategoryService } from "./subCategory.service";
import {
  CategoryRepository,
  ProductRepository,
  SubCategoryRepository,
} from "src/DB/repositories";
import { ConstantsService, UploadCloudFileService } from "src/common/services";

@Module({
  imports: [SubCategoryModel, CategoryModel, ProductModel],
  controllers: [SubCategoryController],
  providers: [
    SubCategoryService,
    SubCategoryRepository,
    CategoryRepository,
    ProductRepository,
    UploadCloudFileService,
    ConstantsService,
  ],
})
export class SubCategoryModule {}
