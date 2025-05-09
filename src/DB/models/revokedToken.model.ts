import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { User } from "./user.model";

// RevokedToken schema
@Schema({ timestamps: true })
export class RevokedToken {
  @Prop({
    required: true,
    type: String,
    index: { name: "tokenId", index: true },
  })
  tokenId: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId | string;

  @Prop({ required: true, type: Date, default: Date.now })
  expiredAt: Date;
}

// RevokedToken schema
export const RevokedTokenSchema = SchemaFactory.createForClass(RevokedToken);

// Create Model
export const RevokedTokenModel = MongooseModule.forFeature([
  { name: RevokedToken.name, schema: RevokedTokenSchema },
]);

// RevokedToken Type
export type RevokedTokenType = HydratedDocument<RevokedToken>;
