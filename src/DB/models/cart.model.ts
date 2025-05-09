import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument, Types } from "mongoose";

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: string | Types.ObjectId;

  @Prop({
    type: [
      {
        productId: { type: Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        finalPrice: { type: Number, required: true },
      },
    ],
  })
  products: {
    productId: string | Types.ObjectId;
    quantity: number;
    finalPrice: number;
  }[];

  @Prop({ type: Number })
  totalAmount: number;
}

const cartSchema = SchemaFactory.createForClass(Cart);

export const CartModel = MongooseModule.forFeature([
  { name: Cart.name, schema: cartSchema },
]);

export type cartType = HydratedDocument<Cart> & Document;

cartSchema.pre("save", function (next) {
  this.totalAmount = this.products.reduce(
    (total, product) => total + product.finalPrice * product.quantity,
    0,
  );
  next();
});
