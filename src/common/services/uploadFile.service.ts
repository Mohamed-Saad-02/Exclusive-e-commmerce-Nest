import { v2 as cloudinary, UploadApiOptions } from "cloudinary";
import { Injectable, BadRequestException } from "@nestjs/common";
import { CloudinaryConfig } from "../config";

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

@Injectable()
export class UploadCloudFileService {
  constructor() {
    CloudinaryConfig();
  }

  /**
   * Uploads a single file to Cloudinary
   */
  async uploadFile(
    file: Express.Multer.File,
    options: UploadApiOptions,
  ): Promise<CloudinaryUploadResult> {
    try {
      if (!file) {
        throw new BadRequestException("File is required");
      }

      const result = await cloudinary.uploader.upload(file.path, options);

      return {
        secure_url: result.secure_url,
        public_id: result.public_id,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Uploads multiple files to Cloudinary
   */
  async uploadFiles(
    files: Express.Multer.File[],
    options: UploadApiOptions,
  ): Promise<CloudinaryUploadResult[]> {
    try {
      if (!files?.length) {
        throw new BadRequestException("Files array is required");
      }

      const uploadPromises = files.map((file) =>
        this.uploadFile(file, options),
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new BadRequestException(`Failed to upload files: ${error.message}`);
    }
  }

  /**
   * Deletes a single file from Cloudinary
   */
  async deleteFile(public_id: string): Promise<void> {
    try {
      if (!public_id) {
        throw new BadRequestException("Public ID is required");
      }

      await cloudinary.uploader.destroy(public_id);
    } catch (error) {
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Deletes multiple files from Cloudinary
   */
  async deleteFiles(public_ids: string[]): Promise<void> {
    try {
      if (!public_ids?.length) {
        throw new BadRequestException("Public IDs array is required");
      }

      const deletePromises = public_ids.map((id) => this.deleteFile(id));
      await Promise.all(deletePromises);
    } catch (error) {
      throw new BadRequestException(`Failed to delete files: ${error.message}`);
    }
  }

  /**
   * Deletes a folder and its contents from Cloudinary
   */
  async deleteFolderByPrefix(prefix: string): Promise<void> {
    console.log(prefix);

    try {
      if (!prefix) {
        throw new BadRequestException("Folder prefix is required");
      }

      await cloudinary.api.delete_resources_by_prefix(prefix);
      await cloudinary.api.delete_folder(prefix);
    } catch (error) {
      console.log(error);

      throw new BadRequestException(
        `Failed to delete folder: ${error.message}`,
      );
    }
  }
}
