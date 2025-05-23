import { v2 as cloudinaryV2, ConfigOptions } from "cloudinary";

export const CloudinaryConfig = (): ConfigOptions => {
  return cloudinaryV2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};
