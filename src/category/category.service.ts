import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConstantsService, UploadCloudFileService } from "src/common/services";
import { CategoryType } from "src/DB/models";
import { CategoryRepository } from "src/DB/repositories";

import slugify from "slugify";
import { v4 as uuid } from "uuid";

interface ICreateCategory {
  name: string;
  userId: string;
  image?: Express.Multer.File;
}

interface IUpdateCategory {
  name?: string;
  image?: Express.Multer.File;
  userId: string;
  categoryId: string;
}

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly uploadFileService: UploadCloudFileService,
    private readonly constantsService: ConstantsService,
  ) {}

  async createCategory({ name, userId, image }: ICreateCategory) {
    const existing = await this.categoryRepository.exists({
      filters: { name },
    });

    if (existing) throw new BadRequestException("Category already exists");

    const category = {
      name,
      createdBy: userId,
    };

    if (image) {
      const folder = `${this.constantsService.CLOUDINARY_FOLDER_CATEGORY}`;
      const uploadedImage = await this.uploadFileService.uploadFile(image, {
        folder,
      });

      category["image"] = {
        secure_url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id,
      };
    }

    const newCategory = await this.categoryRepository.create(category);

    return {
      _id: newCategory._id,
      name: newCategory.name,
      image: newCategory?.image?.secure_url,
    };
  }

  async updateCategory({ name, image, userId, categoryId }: IUpdateCategory) {
    const category = await this.categoryRepository.findOne({
      filters: { _id: categoryId },
    });

    if (!category) throw new NotFoundException("Category not found");

    if (name) {
      const existing = await this.categoryRepository.exists({
        filters: { name },
      });

      if (existing) throw new BadRequestException("Category already exists");

      category["name"] = name;
      category["slug"] = slugify(name);
    }

    if (image) {
      const categoryHasImg = !!category.image?.public_id;

      const uploadedImage = await this.uploadFileService.uploadFile(image, {
        folder: `${process.env.CLOUDINARY_FOLDER}/Category`,
        public_id: categoryHasImg ? category.image?.public_id : undefined,
      });

      if (categoryHasImg) {
        category["image"].secure_url = uploadedImage.secure_url;
      } else
        category.image = {
          secure_url: uploadedImage.secure_url,
          public_id: uploadedImage.public_id,
        };
    }

    category["updatedBy"] = userId;

    const updatedCategory = await this.categoryRepository.updateOne({
      filters: { _id: categoryId },
      data: category,
    });

    if (!updatedCategory)
      throw new BadRequestException("Failed to update category");

    return {
      _id: updatedCategory._id,
      name: updatedCategory.name,
      image: updatedCategory.image.secure_url,
    };
  }

  async getCategories(): Promise<CategoryType[]> {
    const categories = await this.categoryRepository.find({ filters: {} });
    return categories;
  }

  async getCategory(categoryId: string): Promise<CategoryType> {
    const category = await this.categoryRepository.findOne({
      filters: { _id: categoryId },
    });
    if (!category) throw new NotFoundException("Category not found");
    return category;
  }

  async deleteCategory(categoryId: string) {
    await this.categoryRepository.deleteCategory(categoryId);
    return { message: "Category deleted successfully" };
  }
}
