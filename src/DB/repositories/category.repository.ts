import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { BaseRepository } from "../base.service";
import { Category, CategoryType } from "../models";
import { ProductRepository } from "./product.repository";
import { UploadCloudFileService } from "src/common/services";
import { ConstantsService } from "src/common/services/constants.service";

@Injectable()
export class CategoryRepository extends BaseRepository<CategoryType> {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryType>,
    private readonly productRepository: ProductRepository,
    private readonly uploadFileService: UploadCloudFileService,
    private readonly constantsService: ConstantsService,
  ) {
    super(categoryModel);
  }

  async isCategoryExist(categoryId: string, err = true) {
    const category = await this.exists({ filters: { _id: categoryId } });
    if (err && category) throw new NotFoundException("Category Not Found");
    return category;
  }

  async deleteCategory(categoryId: string) {
    const category = await this.findOne({
      filters: { _id: categoryId },
    });
    if (!category) throw new NotFoundException("Category not found");

    // Delete Image from Cloudinary
    if (category.image) {
      const publicId = category.image.public_id;

      this.uploadFileService.deleteFile(publicId).then(
        async () =>
          await this.deleteOne({
            filters: { _id: categoryId },
          }),
      );
    } else {
      await this.deleteOne({
        filters: { _id: categoryId },
      });
    }

    // const productsFoldersId = (
    //   await this.productRepository.find({
    //     filters: { category: new Types.ObjectId(categoryId) },
    //   })
    // ).map((product) => product.folderId);

    // if (productsFoldersId)
    //   await Promise.all(
    //     productsFoldersId.map((folderId) =>
    //       this.uploadFileService.deleteFolderByPrefix(
    //         `${this.constantsService.CLOUDINARY_FOLDER_PRODUCT}/${folderId}`,
    //       ),
    //     ),
    //   );

    // await this.productRepository.deleteMany({
    //   filters: { category: new Types.ObjectId(categoryId) },
    // });

    return category;
  }
}
