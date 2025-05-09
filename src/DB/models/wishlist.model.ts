import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument, Types } from "mongoose";

@Schema({ timestamps: true })
export class Wishlist {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: string | Types.ObjectId;

  @Prop({
    type: [{ type: Types.ObjectId, ref: "Product", required: true }],
  })
  products: [string | Types.ObjectId];
}

const wishlistSchema = SchemaFactory.createForClass(Wishlist);

export const WishlistModel = MongooseModule.forFeature([
  { name: Wishlist.name, schema: wishlistSchema },
]);

export type WishlistType = HydratedDocument<Wishlist> & Document;
