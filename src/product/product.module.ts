import { Module } from "@nestjs/common";
import {
  BrandModel,
  CategoryModel,
  ProductModel,
  SubCategoryModel,
} from "src/DB/models";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { ConstantsService, UploadCloudFileService } from "src/common/services";
import {
  CategoryRepository,
  ProductRepository,
  SubCategoryRepository,
} from "src/DB/repositories";
import { CategoryService } from "src/category/category.service";
import { BrandRepository } from "src/DB/repositories/brand.repository";

@Module({
  imports: [ProductModel, CategoryModel, SubCategoryModel, BrandModel],
  controllers: [ProductController],
  providers: [
    ProductService,
    UploadCloudFileService,
    ProductRepository,
    CategoryRepository,
    SubCategoryRepository,
    BrandRepository,
    ConstantsService,
  ],
})
export class ProductModule {}
