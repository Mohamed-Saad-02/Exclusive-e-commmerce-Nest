import { IsMongoId, IsNotEmpty, IsNumber } from "class-validator";
import { Types } from "mongoose";

export class AddToWishlistDTO {
  @IsNotEmpty()
  @IsMongoId()
  productId: Types.ObjectId | string;
}

export class RemoveFromWishlistDTO {
  @IsNotEmpty()
  @IsMongoId()
  productId: Types.ObjectId | string;
}
