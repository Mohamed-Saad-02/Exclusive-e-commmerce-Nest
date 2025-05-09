import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { BannerRepository } from "src/DB/repositories/banner.repository";
import { CreateBannerDTO, UpdateBannerDTO } from "./DTO/banner.dto";
import { BannerDocument } from "src/DB/models/banner.model";
import { Document, Types } from "mongoose";
import { ConstantsService, UploadCloudFileService } from "src/common/services";

interface ICreateBanner extends CreateBannerDTO {
  userId: string;
}

interface IUpdateBanner extends UpdateBannerDTO {
  bannerId: string;
}

@Injectable()
export class BannerService {
  constructor(
    private readonly bannerRepository: BannerRepository,
    private readonly constantsService: ConstantsService,
    private readonly uploadFileService: UploadCloudFileService,
  ) {}

  async getAll() {
    const banners = await this.bannerRepository.find({
      filters: { isActive: true },
    });
    return banners.map((banner) => {
      return {
        id: banner._id,
        title: banner.title,
        img: banner.img.secure_url,
      };
    });
  }

  async getOne(id: string) {
    const banner = await this.bannerRepository.findOne({
      filters: { _id: id },
    });
    if (!banner) throw new NotFoundException("Banner Not Found");

    return {
      id: banner._id,
      title: banner.title,
      img: banner.img.secure_url,
    };
  }

  async create(data: ICreateBanner) {
    const { title, img, userId } = data || {};
    if (!img) throw new BadRequestException("img is Required");

    const newBanner: Partial<Omit<BannerDocument, keyof Document>> = {
      title,
    };

    const isBannerExist = await this.bannerRepository.exists({
      filters: { title: { $regex: new RegExp(`^${title}$`, "i") } },
    });
    if (isBannerExist) throw new BadRequestException("Banner Is Exist");

    const folder = this.constantsService.CLOUDINARY_FOLDER_Banner;
    const uploadFile = await this.uploadFileService.uploadFile(img, {
      folder,
    });

    newBanner.img = {
      public_id: uploadFile.public_id,
      secure_url: uploadFile.secure_url,
    };

    const banner = await this.bannerRepository.create(newBanner);
    return { id: banner._id, name: banner.title, logo: banner.img.secure_url };
  }

  async update(data: IUpdateBanner) {
    const { title, isActive, bannerId } = data || {};

    // Check if banner exists with same title but different ID
    const existingBanner = await this.bannerRepository.findOne({
      filters: {
        title: { $regex: new RegExp(`^${title}$`, "i") },
        _id: { $ne: bannerId },
      },
    });

    if (existingBanner)
      throw new BadRequestException("Banner with this title already exists");

    const banner = await this.bannerRepository.updateOne({
      filters: { _id: data.bannerId },
      data: { $set: { title, isActive } },
    });

    if (!banner) throw new BadRequestException("Banner not fined");

    return { message: "Banner updated successfully" };
  }

  async delete(bannerId: string) {
    if (!bannerId) throw new BadRequestException("bannerId is required");

    const banner = await this.bannerRepository.findOne({
      filters: { _id: bannerId },
    });
    if (!banner) throw new NotFoundException("Banner not defined");

    const publicId = banner.img.public_id;

    this.uploadFileService
      .deleteFile(publicId)
      .then(
        async () =>
          await this.bannerRepository.deleteOne({
            filters: { _id: banner._id },
          }),
      )
      .catch(() => {
        throw new BadRequestException("Failed To Delete Banner");
      });

    return { message: "Banner Delete Successfully" };
  }
}
