import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { AtLeastOneField } from "src/common/validator";

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  image?: string;
}

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsOptional()
  image: Express.Multer.File;

  @AtLeastOneField(["name", "image"])
  dummy?: any;
}
