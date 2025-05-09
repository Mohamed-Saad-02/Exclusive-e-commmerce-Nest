import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  Validate,
  ValidateIf,
} from "class-validator";
import { SortOrder, Types } from "mongoose";
import { DiscountType } from "src/common/types";
import { AtLeastOneField } from "src/common/validator";

function validateDiscountLessThanBasePrice(object: any) {
  if (
    object.discountType === DiscountType.FIXED &&
    object.discount > object.basePrice
  ) {
    return false;
  }
  return true;
}

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description: string;

  @IsOptional()
  images: Express.Multer.File[];

  @IsNotEmpty()
  @IsMongoId()
  brand: string;

  @IsNotEmpty()
  @IsMongoId()
  category: string;

  @IsNotEmpty()
  @IsMongoId()
  subCategory: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  basePrice: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsInt()
  stock: number;

  @ValidateIf((o) => o.discount !== undefined) // إذا تم إرسال discount
  @IsNotEmpty()
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ValidateIf((o) => o.discountType !== undefined) // إذا تم إرسال discountType
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @ValidateIf(
    (o) =>
      o.discountType === DiscountType.PERCENTAGE ||
      o.discountType === DiscountType.FIXED,
  )
  @ValidateIf(
    (o) => o.discountType === DiscountType.PERCENTAGE && o.discount <= 100,
  )
  @Validate(validateDiscountLessThanBasePrice, {
    message: "Fixed discount cannot be more than base price",
  })
  discount: number;

  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  @Min(0)
  overAllRating: number;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  images?: Express.Multer.File[];

  @IsOptional()
  @Type(() => Types.ObjectId)
  @IsMongoId()
  category?: string;

  @IsOptional()
  @Type(() => Types.ObjectId)
  @IsMongoId()
  subCategory?: string;

  @IsOptional()
  @Type(() => Types.ObjectId)
  @IsMongoId()
  brand?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  basePrice?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  stock?: number;

  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @ValidateIf((o) => o.discount !== undefined)
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @ValidateIf(
    (o) =>
      o.discountType === DiscountType.PERCENTAGE ||
      o.discountType === DiscountType.FIXED,
  )
  @ValidateIf(
    (o) => o.discountType === DiscountType.PERCENTAGE && o.discount <= 100,
  )
  @Validate(validateDiscountLessThanBasePrice, {
    message: "Fixed discount cannot be more than base price",
  })
  @IsOptional()
  discount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  overAllRating?: number;

  @AtLeastOneField([
    "name",
    "description",
    "discount",
    "discountType",
    "stock",
    "basePrice",
    "categoryId",
    "subCategoryId",
    "brandId",
    "categoryId",
    "images",
  ])
  dumy?: any;
}

export class GetProductsDto {
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  limit: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  page: number;

  @IsString()
  @IsOptional()
  sort: { [key: string]: SortOrder };
}
