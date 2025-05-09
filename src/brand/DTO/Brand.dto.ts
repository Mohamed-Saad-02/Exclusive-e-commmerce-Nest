import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateBrandDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  logo: Express.Multer.File;
}

export class UpdateBrandDTO {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  logo: Express.Multer.File;
}
