import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "./user.model";
import slugify from "slugify";

export type BrandDocument = Brand & Document;

@Schema({ timestamps: true })
export class Brand {
  @Prop({ required: true, unique: true, index: true })
  name: string;

  @Prop({
    default: function (this: Brand) {
      return slugify(this.name, { lower: true, trim: true });
    },
    index: { name: "brand_slug_index" },
  })
  slug: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  addedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name })
  updatedBy: Types.ObjectId;

  @Prop({ type: Object })
  logo: {
    secure_url: string;
    public_id: string;
  };

  @Prop({ default: false })
  isDeleted: boolean;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);

export const BrandModel = MongooseModule.forFeature([
  { name: Brand.name, schema: BrandSchema },
]);

BrandSchema.pre("save", function (next) {
  if (this.isModified("name"))
    this.slug = slugify(this.name, { lower: true, trim: true });

  next();
});
