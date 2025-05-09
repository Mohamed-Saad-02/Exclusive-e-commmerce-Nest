import { Module } from "@nestjs/common";
import { BrandModel } from "src/DB/models";
import { BrandController } from "./brand.controller";
import { BrandService } from "./brand.service";
import { BrandRepository } from "src/DB/repositories/brand.repository";
import { ConstantsService, UploadCloudFileService } from "src/common/services";

@Module({
  imports: [BrandModel],
  controllers: [BrandController],
  providers: [
    BrandService,
    BrandRepository,
    ConstantsService,
    UploadCloudFileService,
  ],
})
export class BrandModule {}
