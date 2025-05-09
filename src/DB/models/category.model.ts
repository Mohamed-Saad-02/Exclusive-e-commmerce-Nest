import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { User } from "./user.model";
import slugify from "slugify";

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true, index: true })
  name: string;

  @Prop({
    default: function (this: Category) {
      return slugify(this.name, { lower: true, trim: true });
    },
    index: { name: "category_slug_index" },
  })
  slug: string;

  @Prop({ type: Object })
  image: {
    secure_url: string;
    public_id: string;
  };

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy: Types.ObjectId | string;

  @Prop({ type: Types.ObjectId, ref: User.name })
  updatedBy: Types.ObjectId | string;
}

// Category Type
export type CategoryType = HydratedDocument<Category>;

// Category Schema
export const CategorySchema = SchemaFactory.createForClass(Category);

// Create Model
export const CategoryModel = MongooseModule.forFeature([
  { name: Category.name, schema: CategorySchema },
]);
