import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { AtLeastOneField } from "src/common/validator";

export class CreateBannerDTO {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  img: Express.Multer.File;
}

export class UpdateBannerDTO {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @AtLeastOneField(["title", "isActive"])
  dummy?: any;
}
