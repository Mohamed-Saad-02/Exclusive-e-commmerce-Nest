import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { BaseRepository } from "../base.service";
import { SubCategory, SubCategoryType } from "../models";

@Injectable()
export class SubCategoryRepository extends BaseRepository<SubCategoryType> {
  constructor(
    @InjectModel(SubCategory.name)
    private readonly subCategoryModel: Model<SubCategoryType>,
  ) {
    super(subCategoryModel);
  }

  async isCategoryHasSubCategoryName(categoryId: Types.ObjectId, name: string) {
    const hasSameName = await this.exists({
      filters: {
        categoryId: new Types.ObjectId(categoryId),
        name: { $regex: new RegExp(`^${name}$`, "i") },
      },
    });

    if (hasSameName)
      throw new BadRequestException("Category Has Same SubCategory Name");
  }
}
