import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { BrandRepository } from "src/DB/repositories/brand.repository";
import { CreateBrandDTO, UpdateBrandDTO } from "./DTO/Brand.dto";
import { BrandDocument } from "src/DB/models";
import { Document, Types } from "mongoose";
import { ConstantsService, UploadCloudFileService } from "src/common/services";

interface ICreateBrand extends CreateBrandDTO {
  userId: string;
}

interface IUpdateBrand extends UpdateBrandDTO {
  userId: string;
  brandId: string;
}

@Injectable()
export class BrandService {
  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly constantsService: ConstantsService,
    private readonly uploadFileService: UploadCloudFileService,
  ) {}

  async getAllService() {
    return await this.brandRepository.find({ filters: {} });
  }

  async createBrandService(data: ICreateBrand) {
    const { name, logo, userId } = data || {};

    const newBrand: Partial<Omit<BrandDocument, keyof Document>> = {
      addedBy: new Types.ObjectId(userId),
      name,
    };

    const isBrandExist = await this.brandRepository.exists({
      filters: { name: { $regex: new RegExp(`^${name}$`, "i") } },
    });
    if (isBrandExist) throw new BadRequestException("Brand Is Exist");

    if (logo) {
      const folder = this.constantsService.CLOUDINARY_FOLDER_BRAND;
      const uploadFile = await this.uploadFileService.uploadFile(logo, {
        folder,
      });

      newBrand.logo = {
        public_id: uploadFile.public_id,
        secure_url: uploadFile.secure_url,
      };
    }

    const brand = await this.brandRepository.create(newBrand);
    return { _id: brand._id, name: brand.name, logo: brand.logo.secure_url };
  }

  async getOneService(brandId: string) {
    const brand = await this.brandRepository.findOne({
      filters: { _id: brandId },
      select: ["_id", "name", "logo"],
    });

    if (!brand) throw new NotFoundException("Brand Not Found");

    return brand;
  }

  async deleteBrand(userId: string, brandId: string) {
    const brand = await this.brandRepository.updateOne({
      filters: { _id: brandId, isDeleted: false },
      data: { isDeleted: true, updatedBy: new Types.ObjectId(userId) },
      select: ["_id", "name", "logo"],
    });

    if (!brand) throw new NotFoundException("Brand Not Found");

    return brand;
  }

  async updateBrand(data: IUpdateBrand) {
    const { name, logo, userId, brandId } = data;

    if (!name && !logo) throw new BadRequestException("At least update one");

    const brand = await this.brandRepository.findOne({
      filters: { _id: brandId },
    });
    if (!brand) throw new NotFoundException("Brand Not Found");

    if (name) {
      const isBrandNameExist = await this.brandRepository.exists({
        filters: { name: { $regex: new RegExp(`^${name}$`, "i") } },
      });

      if (isBrandNameExist)
        throw new BadRequestException("Brand Name is Exist");
    }

    if (logo) {
      const isBrandHasImg = !!brand.logo?.public_id;
      const folder = isBrandHasImg
        ? undefined
        : this.constantsService.CLOUDINARY_FOLDER_BRAND;
      const public_id = brand.logo?.public_id || undefined;

      const uploadFile = await this.uploadFileService.uploadFile(logo, {
        folder,
        public_id,
      });

      brand.logo = {
        public_id: uploadFile.public_id,
        secure_url: uploadFile.secure_url,
      };
    }

    brand.updatedBy = new Types.ObjectId(userId);

    await brand.save();

    return { message: "updated Successfully" };
  }
}
