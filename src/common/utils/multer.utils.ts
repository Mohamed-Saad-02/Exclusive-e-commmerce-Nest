import { BadRequestException } from "@nestjs/common";
import { Request } from "express";
import { diskStorage } from "multer";
import { ImageAllowedTypes } from "src/constants/constants";

interface IUploadFileOptions {
  allowedFileTypes?: string[];
}

export const UploadFileOptions = ({
  allowedFileTypes = ImageAllowedTypes,
}: IUploadFileOptions) => {
  const storage = diskStorage({});

  const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: Function,
  ) => {
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException("Invalid file type"), false);
    }
  };

  return {
    fileFilter,
    storage,
  };
};
