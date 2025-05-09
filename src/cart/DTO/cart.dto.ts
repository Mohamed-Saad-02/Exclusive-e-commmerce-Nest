import { IsMongoId, IsNotEmpty, IsNumber } from "class-validator";
import { Types } from "mongoose";

export class AddToCartDTO {
  @IsNotEmpty()
  @IsMongoId()
  productId: Types.ObjectId | string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export class RemoveFromCartDTO {
  @IsNotEmpty()
  @IsMongoId()
  productId: Types.ObjectId | string;
}

export class UpdateCartDTO {
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsMongoId()
  productId: Types.ObjectId | string;
}
