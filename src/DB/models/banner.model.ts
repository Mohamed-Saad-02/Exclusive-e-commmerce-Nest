import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "./user.model";

@Schema({ timestamps: true })
export class Banner {
  @Prop({ required: true, unique: true, index: true })
  title: string;

  @Prop({ type: Object })
  img: {
    secure_url: string;
    public_id: string;
  };

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);

export const BannerModel = MongooseModule.forFeature([
  { name: Banner.name, schema: BannerSchema },
]);

export type BannerDocument = Banner & Document;
