import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CategoryRepository,
  ProductRepository,
  SubCategoryRepository,
} from "src/DB/repositories";
import { CreateProductDto, UpdateProductDto } from "./DTO/product.dto";

import { Document, Types } from "mongoose";
import slugify from "slugify";
import { QueryOptionsDto } from "src/common/DTO";
import { ConstantsService, UploadCloudFileService } from "src/common/services";
import { ProductStatus } from "src/common/types";
import { mapperFilter } from "src/common/utils";
import { ProductDocument } from "src/DB/models";
import { BrandRepository } from "src/DB/repositories/brand.repository";

interface ICreateProduct extends CreateProductDto {
  userId: string;
}

interface IUpdateProduct extends UpdateProductDto {
  userId: string;
  productId: string;
}

@Injectable()
export class ProductService {
  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly subCategoryRepository: SubCategoryRepository,
    private readonly productRepository: ProductRepository,
    private readonly uploadFileService: UploadCloudFileService,
    private readonly constantsService: ConstantsService,
  ) {}

  async createProduct(body: ICreateProduct) {
    const { userId, ...product } = body;

    if (!body.images.length && body.images.length <= 4)
      throw new BadRequestException("Images are required");

    const category = await this.categoryRepository.exists({
      filters: { _id: product.category },
    });

    if (!category) throw new NotFoundException("Category Not Found");

    const subCategory = await this.subCategoryRepository.exists({
      filters: { _id: product.subCategory, categoryId: category._id },
    });

    if (!subCategory)
      throw new NotFoundException(
        "SubCategory not found or not belong to this category",
      );

    const brand = await this.brandRepository.findOne({
      filters: { _id: product.brand },
    });

    if (!brand) throw new NotFoundException("Brand not found");

    const folder = `${this.constantsService.CLOUDINARY_FOLDER_PRODUCT}`;
    const uploadFiles = await this.uploadFileService.uploadFiles(body.images, {
      folder,
    });

    const transformedProduct = {
      ...product,
      images: uploadFiles.map((file) => ({
        public_id: file.public_id,
        secure_url: file.secure_url,
      })),
      addedBy: userId.toString(),
      category: category._id,
      brand: new Types.ObjectId(brand._id as string),
      subCategory: subCategory._id,
      discount: {
        discount: product.discount,
        discountType: product.discountType,
      },
    };

    const newProduct = await this.productRepository.create(transformedProduct);

    return newProduct;
  }

  async updateProduct(data: IUpdateProduct) {
    const {
      userId,
      productId,
      images,
      discount,
      discountType,
      ...productRequested
    } = data;

    const product = await this.productRepository.findOne({
      filters: { _id: productId },
    });
    if (!product) throw new NotFoundException("Product not found");

    const productUpdated: Partial<Omit<ProductDocument, keyof Document>> = {
      updatedBy: new Types.ObjectId(userId),
      ...productRequested,
      ...(discount !== undefined && discountType
        ? {
            discount: {
              discount,
              discountType,
            },
          }
        : {}),
    };

    if (productRequested.name) {
      const isProductHasSameName = await this.productRepository.exists({
        filters: {
          name: { $regex: new RegExp(`^${productRequested.name}$`, "i") },
        },
      });

      if (isProductHasSameName)
        throw new BadRequestException("There are product has same name");

      productUpdated.name = productRequested.name;
      productUpdated.slug = slugify(productRequested.name);
    }

    if (productRequested.category) {
      await this.categoryRepository.isCategoryExist(productRequested.category);
    }

    if (productRequested.subCategory) {
      const subCategory = await this.subCategoryRepository.exists({
        filters: { _id: productRequested.subCategory },
      });

      if (!subCategory) throw new NotFoundException("SubCategory not found");
    }

    if (productRequested.brand) {
      const brand = await this.brandRepository.exists({
        filters: { _id: productRequested.brand },
      });

      if (!brand) throw new NotFoundException("Brand Not Found");
    }

    if (images) {
      const productsPublicIds = product.images.map((img) => img.public_id);
      await this.uploadFileService.deleteFiles(productsPublicIds);

      const uploadedImages = await this.uploadFileService.uploadFiles(images, {
        folder: this.constantsService.CLOUDINARY_FOLDER_PRODUCT,
      });

      productUpdated.images = uploadedImages.map((img) => ({
        public_id: img.public_id,
        secure_url: img.secure_url,
      }));
    }

    const updated = await this.productRepository.updateOne({
      filters: { _id: product._id },
      data: productUpdated,
      select: "-addedBy -isDeleted -slug -updatedBy",
      populate: [{ path: "category", select: "name image" }],
    });

    return updated;
  }

  async getAllProducts(query: QueryOptionsDto) {
    const { limit = 10, page = 1, sort, ...filter } = query;
    const skip = (page - 1) * limit;

    const filters = mapperFilter(filter);

    const products = await this.productRepository.find({
      filters: { isDeleted: false, ...filters },
      limit,
      skip,
      sort,
      select: "-addedBy -isDeleted -slug -status",
      populate: [{ path: "category", select: "_id name image" }],
    });

    return {
      metadata: {
        page,
        results: products.length,
        limit,
      },

      products,
    };
  }

  async getOneService(productId: string) {
    const product = await this.productRepository.findOne({
      filters: {
        _id: productId,
        isDeleted: false,
        status: ProductStatus.ACTIVE,
      },
      select: "-addedBy -isDeleted -slug -status",
      populate: [
        { path: "category", select: "_id name image" },
        { path: "brand", select: "_id name logo" },
        { path: "subCategory", select: "_id name image" },
      ],
    });

    if (!product) throw new NotFoundException("Product Not Found");

    return product;
  }

  async deleteOneService(userId: string, productId: string) {
    const product = await this.productRepository.exists({
      filters: { _id: productId, isDeleted: false },
    });

    if (!product) throw new NotFoundException("Product not found");

    const deletedProduct = await this.productRepository.updateOne({
      filters: { _id: product._id },
      data: { isDeleted: true, updatedBy: new Types.ObjectId(userId) },
    });

    if (!deletedProduct)
      throw new BadRequestException("Failed To Delete Product");

    const public_ids = deletedProduct.images.map((img) => img.public_id);

    await this.uploadFileService.deleteFiles(public_ids);

    return { message: "Product Deleted Successfully" };
  }
}
