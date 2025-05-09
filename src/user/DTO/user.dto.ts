import { Transform, Type } from "class-transformer";
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  MinLength,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { AtLeastOneField } from "src/common/validator";

import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";

export function FirstAndLastNameBothOrNone(
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "FirstAndLastNameBothOrNone",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(_: any, args: ValidationArguments) {
          const obj = args.object as any;
          const firstNamePresent = !!obj.firstName;
          const lastNamePresent = !!obj.lastName;

          return (
            (!firstNamePresent && !lastNamePresent) ||
            (firstNamePresent && lastNamePresent)
          );
        },
        defaultMessage(args: ValidationArguments) {
          return "First name and last name must both be provided or both be empty";
        },
      },
    });
  };
}

export class ChangePasswordDto {
  @IsStrongPassword({}, { message: "oldPassword is not strong enough" })
  @IsNotEmpty({ message: "oldPassword is required" })
  oldPassword: string;

  @IsStrongPassword({}, { message: "newPassword is not strong enough" })
  @IsNotEmpty({ message: "newPassword is required" })
  newPassword: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: "First name must be a string" })
  @IsNotEmpty({ message: "First name is required" })
  @MinLength(3, { message: "First name must be at least 3 characters long" })
  firstName: string;

  @IsOptional()
  @IsString({ message: "Last name must be a string" })
  @IsNotEmpty({ message: "Last name is required" })
  @MinLength(3, { message: "Last name must be at least 3 characters long" })
  lastName: string;

  @IsOptional()
  @IsEmail({}, { message: "Invalid email" })
  @IsNotEmpty({ message: "Email is required" })
  email: string;

  @IsOptional()
  @IsPhoneNumber("EG", { message: "Invalid phone number" })
  @IsNotEmpty({ message: "Phone number is required" })
  phone: string;

  @IsOptional()
  @IsDate({ message: "Invalid date of birth" })
  @Transform(({ value }) => new Date(value))
  DOB: Date;

  @AtLeastOneField(["firstName", "lastName", "email", "phone", "DOB"])
  @ValidateNested()
  @Type(() => UpdateProfileDto)
  data: UpdateProfileDto;

  @FirstAndLastNameBothOrNone({
    message: "First name and last name must both be provided or both be empty",
  })
  checkNames?: boolean;
}
