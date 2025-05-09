import { Transform } from "class-transformer";
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  Length,
  MinLength,
} from "class-validator";
import { UserGender, UserRole } from "src/common/types";

export class SignUpDto {
  @IsString({ message: "First name must be a string" })
  @IsNotEmpty({ message: "First name is required" })
  @MinLength(3, { message: "First name must be at least 3 characters long" })
  firstName: string;

  @IsString({ message: "Last name must be a string" })
  @IsNotEmpty({ message: "Last name is required" })
  @MinLength(3, { message: "Last name must be at least 3 characters long" })
  lastName: string;

  @IsEmail({}, { message: "Invalid email" })
  @IsNotEmpty({ message: "Email is required" })
  email: string;

  @IsStrongPassword({}, { message: "Password is not strong enough" })
  @IsNotEmpty({ message: "Password is required" })
  password: string;

  @IsEnum(UserRole, { message: "Invalid role" })
  role: string;

  @IsEnum(UserGender, { message: "Invalid gender" })
  @IsNotEmpty({ message: "Gender is required" })
  gender: string;

  @IsPhoneNumber("EG", { message: "Invalid phone number" })
  @IsNotEmpty({ message: "Phone number is required" })
  phone: string;

  @IsDate({ message: "Invalid date of birth" })
  @Transform(({ value }) => new Date(value))
  DOB: Date;
}

export class SignInDto {
  @IsEmail({}, { message: "Invalid email" })
  @IsNotEmpty({ message: "Email is required" })
  email: string;

  @IsStrongPassword({}, { message: "Password is not strong enough" })
  @IsNotEmpty({ message: "Password is required" })
  password: string;
}

export class ConfirmEmailDto {
  @IsEmail({}, { message: "Invalid email" })
  @IsNotEmpty({ message: "Email is required" })
  email: string;

  @IsString({ message: "OTP is required" })
  @IsNotEmpty({ message: "OTP is required" })
  @Length(6, 6, { message: "OTP must be 6 digits" })
  otp: string;
}

export class ForgetPasswordDto {
  @IsEmail({}, { message: "Invalid email" })
  @IsNotEmpty({ message: "Email is required" })
  email: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  @Length(6, 6, { message: "OTP must be 6 digits" })
  otp: string;

  @IsStrongPassword({}, { message: "Password is not strong enough" })
  @IsNotEmpty({ message: "Password is required" })
  password: string;

  @IsEmail({}, { message: "Invalid email" })
  @IsNotEmpty({ message: "Email is required" })
  email: string;
}
