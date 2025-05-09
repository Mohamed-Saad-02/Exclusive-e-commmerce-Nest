import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import slugify from "slugify";
import { DiscountType, ProductStatus } from "src/common/types";
import { Category } from "./category.model";
import { User } from "./user.model";
import { Brand } from "./brand.model";
import { SubCategory } from "./subCategory.model";

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, index: { name: "product_name" }, lowercase: true })
  name: string;

  @Prop({
    default: function (this: Product) {
      return slugify(this.name, { lower: true, trim: true });
    },
    index: { name: "product_slug_index" },
  })
  slug: string;

  @Prop()
  description: string;

  @Prop({ type: [{ public_id: String, secure_url: String }], required: true })
  images: { public_id: string; secure_url: string }[];

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  addedBy: Types.ObjectId | string;

  @Prop({ type: Types.ObjectId, ref: User.name })
  updatedBy: Types.ObjectId | string;

  @Prop({ type: Types.ObjectId, ref: Brand.name, required: true })
  brand: Types.ObjectId | string;

  @Prop({ type: Types.ObjectId, ref: Category.name, required: true })
  category: Types.ObjectId | string;

  @Prop({ type: Types.ObjectId, ref: SubCategory.name, required: true })
  subCategory: Types.ObjectId | string;

  @Prop({ type: Number, required: true })
  basePrice: number;

  @Prop({
    type: {
      discount: {
        type: Number,
        default: 0,
      },
      discountType: {
        type: String,
        enum: Object.values(DiscountType),
        default: DiscountType.PERCENTAGE,
      },
    },
    default: {}, // important to apply the defaults above
  })
  discount: {
    discount: number;
    discountType: DiscountType;
  };

  @Prop({
    type: Number,
    default: function (this: Product) {
      if (this.discount.discountType === DiscountType.PERCENTAGE)
        return this.basePrice - (this.basePrice * this.discount.discount) / 100;
      else return this.basePrice - this.discount.discount;
    },
  })
  finalPrice: number;

  @Prop({ type: Number, required: true, min: 1 })
  stock: number;

  @Prop({
    type: String,
    enum: Object.values(ProductStatus),
    default: function (this: Product) {
      return this.stock > 0 ? ProductStatus.ACTIVE : ProductStatus.INACTIVE;
    },
  })
  status: ProductStatus;

  @Prop({ type: Number, default: 0 })
  overAllRating: number;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

export const ProductModel = MongooseModule.forFeature([
  { name: Product.name, schema: ProductSchema },
]);
