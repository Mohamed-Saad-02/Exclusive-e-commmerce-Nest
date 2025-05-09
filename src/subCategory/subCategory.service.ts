import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { QueryOptionsDto } from "src/common/DTO";
import { mapperFilter } from "src/common/utils";
import { CategoryRepository, SubCategoryRepository } from "src/DB/repositories";
import {
  createSubCategoryDTO,
  UpdateSubCategoryDTO,
} from "./DTO/subCategory.dto";

import { Document, Types } from "mongoose";
import slugify from "slugify";
import { ConstantsService, UploadCloudFileService } from "src/common/services";
import { SubCategoryType } from "src/DB/models";

interface ICreateSubCategory extends createSubCategoryDTO {
  userId: string;
}

interface IUpdateSubCategory extends UpdateSubCategoryDTO {
  userId: string;
  subCategoryId: string;
}

@Injectable()
export class SubCategoryService {
  constructor(
    private subCategoryRepository: SubCategoryRepository,
    private categoryRepository: CategoryRepository,
    private readonly constantsService: ConstantsService,
    private readonly uploadFileService: UploadCloudFileService,
  ) {}

  async getAllService(query: QueryOptionsDto) {
    const { limit = 10, page = 1, sort, ...filter } = query || {};
    const skip = (page - 1) * limit;

    const filters = mapperFilter(filter);

    const subCategories = await this.subCategoryRepository.find({
      filters,
      limit,
      skip,
      sort,
      select: "-addedBy -slug -__v",
    });

    return {
      metadata: {
        limit,
        page,
        results: subCategories.length,
      },
      subCategories,
    };
  }

  async createOneService(data: ICreateSubCategory) {
    const { name, image, categoryId, userId: addedBy } = data || {};

    const subCategory: Partial<Omit<SubCategoryType, keyof Document>> = {
      name,
      addedBy: new Types.ObjectId(addedBy),
    };

    // Check if CategoryId is Exist
    const category = await this.categoryRepository.exists({
      filters: { _id: categoryId },
    });
    if (!category) throw new NotFoundException("No Category with that ID");
    subCategory.categoryId = category._id;

    // Check if There is SubCategory with same name and categoryId
    await this.subCategoryRepository.isCategoryHasSubCategoryName(
      categoryId,
      name,
    );

    // Upload Image based on data has it
    if (image) {
      const folder = `${this.constantsService.CLOUDINARY_FOLDER_SUBCATEGORY}`;
      const uploadFile = await this.uploadFileService.uploadFile(image, {
        folder,
      });

      subCategory["image"] = {
        secure_url: uploadFile.secure_url,
        public_id: uploadFile.public_id,
      };
    }

    // Create SubCategory
    const newSubCategory = await this.subCategoryRepository.create(subCategory);

    return {
      _id: newSubCategory._id,
      name: newSubCategory.name,
      image: newSubCategory.image?.secure_url || undefined,
      categoryId: newSubCategory.categoryId,
    };
  }

  async updateOneService(data: IUpdateSubCategory) {
    const { name, image, categoryId, subCategoryId, userId } = data || {};

    if (!subCategoryId)
      throw new BadRequestException("SubCategoryId is Messing");

    const subCategoryUpdated: Partial<Omit<SubCategoryType, keyof Document>> = {
      updatedBy: new Types.ObjectId(userId),
    };

    const subCategoryStored = await this.subCategoryRepository.findOne({
      filters: { _id: subCategoryId },
    });
    if (!subCategoryStored)
      throw new NotFoundException("SubCategory not found");

    if (name) {
      await this.subCategoryRepository.isCategoryHasSubCategoryName(
        categoryId || subCategoryStored.categoryId,
        name,
      );

      subCategoryUpdated.name = name;
      subCategoryUpdated.slug = slugify(name);
    }

    if (categoryId) {
      const category = await this.categoryRepository.exists({
        filters: { _id: categoryId },
      });

      if (!category) throw new NotFoundException("Category not found");

      subCategoryUpdated.categoryId = new Types.ObjectId(categoryId);
    }

    if (image) {
      const isSubCategoryHasImg = !!subCategoryStored.image?.public_id;
      const folder = isSubCategoryHasImg
        ? undefined
        : this.constantsService.CLOUDINARY_FOLDER_SUBCATEGORY;
      const public_id = subCategoryStored.image?.public_id || undefined;

      const uploadFile = await this.uploadFileService.uploadFile(image, {
        folder,
        public_id,
      });

      subCategoryUpdated.image = {
        public_id: uploadFile.public_id,
        secure_url: uploadFile.secure_url,
      };
    }

    const subCategory = await this.subCategoryRepository.updateOne({
      filters: { _id: subCategoryId },
      data: subCategoryUpdated,
      select: "-slug -addedBy -updatedBy",
    });

    if (!subCategory)
      throw new BadRequestException("Something happen when update");

    return {
      _id: subCategory._id,
      name: subCategory.name,
      image: subCategory.image,
    };
  }

  async getOneService(subCategoryId: string) {
    const subCategory = await this.subCategoryRepository.findOne({
      filters: { _id: subCategoryId },
    });

    if (!subCategory) throw new NotFoundException("SubCategory Not Found");

    return subCategory;
  }

  async deleteOneService(subCategoryId: string) {
    const subCategory = await this.subCategoryRepository.deleteOne({
      filters: { _id: subCategoryId },
    });

    const public_id = subCategory?.image?.public_id;
    if (public_id) await this.uploadFileService.deleteFile(public_id);

    return { message: "deleted Successfully" };
  }
}
