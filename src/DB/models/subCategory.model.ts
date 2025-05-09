import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import slugify from "slugify";
import { Category } from "./category.model";
import { User } from "./user.model";

@Schema({ timestamps: true })
export class SubCategory {
  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    default: function (this: SubCategory) {
      return slugify(this.name, { lower: true, trim: true });
    },
    index: { name: "subCategory_slug_index" },
  })
  slug: string;

  @Prop({ type: Object })
  image?: {
    secure_url: string;
    public_id: string;
  };

  @Prop({ type: Types.ObjectId, ref: Category.name, required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  addedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name })
  updatedBy: Types.ObjectId;
}

// SubCategory Type
export type SubCategoryType = HydratedDocument<SubCategory>;

// SubCategory Schema
export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);

export const SubCategoryModel = MongooseModule.forFeature([
  { name: SubCategory.name, schema: SubCategorySchema },
]);
