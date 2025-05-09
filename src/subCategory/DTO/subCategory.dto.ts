import { Type } from "class-transformer";
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Types } from "mongoose";
import { AtLeastOneField } from "src/common/validator";

export class createSubCategoryDTO {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  categoryId: Types.ObjectId;

  @IsOptional()
  image: Express.Multer.File;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateSubCategoryDTO {
  @IsOptional()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  categoryId: Types.ObjectId;

  @IsOptional()
  image: any;

  @IsOptional()
  @IsNotEmpty()
  name: string;
}
