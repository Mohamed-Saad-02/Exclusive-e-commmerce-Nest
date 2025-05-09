import { Module } from "@nestjs/common";
import { BannerModel } from "src/DB/models/banner.model";
import { BannerController } from "./banner.controller";
import { BannerService } from "./banner.service";
import { BannerRepository } from "src/DB/repositories/banner.repository";
import { ConstantsService, UploadCloudFileService } from "src/common/services";

@Module({
  imports: [BannerModel],
  controllers: [BannerController],
  providers: [
    BannerService,
    BannerRepository,
    ConstantsService,
    UploadCloudFileService,
  ],
})
export class BannerModule {}
