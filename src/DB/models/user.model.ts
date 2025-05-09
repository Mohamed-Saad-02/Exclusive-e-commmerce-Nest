import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument } from "mongoose";
import { decrypt, encrypt, Hash } from "src/common/security";
import { UserGender, UserRole } from "src/common/types";

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, type: String, lowercase: true, trim: true })
  firstName: string;

  @Prop({ required: true, type: String, lowercase: true, trim: true })
  lastName: string;

  @Prop({
    required: true,
    unique: true,
    type: String,
    trim: true,
  })
  email: string;

  @Prop({ required: true, type: String, select: false })
  password: string;

  @Prop({ required: true, type: String, trim: true })
  phone: string;

  @Prop({
    required: true,
    type: String,
    select: false,
    enum: UserRole,
    default: UserRole.USER,
  })
  role: string;

  @Prop({ required: true, type: String, trim: true, enum: UserGender })
  gender: string;

  @Prop(Date)
  DOB: Date;

  @Prop({ required: true, type: Boolean, select: false, default: false })
  isVerified: boolean;

  @Prop({ required: true, type: Boolean, select: false, default: false })
  isDeleted: boolean;

  @Prop(Date)
  changePasswordAt: Date;
}

// User schema
export const UserSchema = SchemaFactory.createForClass(User);

// Type of the User model

// Type of the User model
export type UserType = HydratedDocument<User>;

// Type of the User model without the Document type
export type UserKeysType = Omit<UserType, keyof Document> & { _id: string };

// Create Model
export const UserModel = MongooseModule.forFeature([
  { name: User.name, schema: UserSchema },
]);

// Hooks
UserSchema.pre("save", function (next) {
  if (!this.isModified("password") && !this.isModified("phone")) return next();

  if (this.isModified("password")) this.password = Hash(this.password);
  if (this.isModified("changePasswordAt")) this.changePasswordAt = new Date();

  if (this.isModified("phone") && this.phone) this.phone = encrypt(this.phone);
  next();
});

UserSchema.post(/find/, function (res, next) {
  if (!res) return next();

  if (Array.isArray(res)) {
    res.forEach((doc) => {
      if (doc.phone) doc.phone = decrypt(doc.phone);
    });
  } else res.phone = decrypt(res.phone);

  next();
});
