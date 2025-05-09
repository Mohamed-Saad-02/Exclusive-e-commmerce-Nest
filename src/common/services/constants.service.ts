import { Injectable } from "@nestjs/common";

@Injectable()
export class ConstantsService {
  readonly CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER;
  readonly CLOUDINARY_FOLDER_PRODUCT = `${this.CLOUDINARY_FOLDER}/Product`;
  readonly CLOUDINARY_FOLDER_CATEGORY = `${this.CLOUDINARY_FOLDER}/Category`;
  readonly CLOUDINARY_FOLDER_SUBCATEGORY = `${this.CLOUDINARY_FOLDER}/SubCategory`;
  readonly CLOUDINARY_FOLDER_BRAND = `${this.CLOUDINARY_FOLDER}/Brand`;
  readonly CLOUDINARY_FOLDER_Banner = `${this.CLOUDINARY_FOLDER}/Banner`;
  constructor() {}
}
