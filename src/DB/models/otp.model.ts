import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { User } from "./user.model";
import { OTPType } from "src/common/types";

@Schema({ timestamps: true })
export class OTP {
  @Prop({ required: true, type: String })
  otp: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId | string;

  @Prop({ required: true, type: Date })
  expiredAt: Date;

  @Prop({ required: true, type: String, enum: OTPType })
  otpType: string;
}

// OTP schema
export const OTPSchema = SchemaFactory.createForClass(OTP);

// Create Model
export const OTPModel = MongooseModule.forFeature([
  { name: OTP.name, schema: OTPSchema },
]);

// OTP Document
export type OTPDocument = HydratedDocument<OTP>;
