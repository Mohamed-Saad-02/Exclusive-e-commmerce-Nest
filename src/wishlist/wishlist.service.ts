import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Types } from "mongoose";
import { WishlistRepository } from "src/DB/repositories/wishlist.repository";
import { AddToWishlistDTO, RemoveFromWishlistDTO } from "./DTO/wishlist.dto";
import { ProductRepository } from "src/DB/repositories";
import { ProductStatus } from "src/common/types";

@Injectable()
export class WishlistService {
  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async addToWishlist(userId: string, { productId }: AddToWishlistDTO) {
    const storedProduct = await this.productRepository.findOne({
      filters: {
        _id: productId,
        isDeleted: false,
        status: ProductStatus.ACTIVE,
      },
    });
    if (!storedProduct) throw new NotFoundException("Product Not Found");

    const userWishlist = await this.wishlistRepository.findOne({
      filters: { userId: new Types.ObjectId(userId) },
    });

    if (!userWishlist)
      return this.wishlistRepository.create({
        userId,
        products: [productId],
      });

    const isProductInWishlist = userWishlist.products.find(
      (product) => product.toString() === productId.toString(),
    );

    if (isProductInWishlist)
      throw new BadRequestException("Product already in Wishlist");

    return await this.wishlistRepository.updateOne({
      filters: { userId },
      data: { $push: { products: productId } },
    });
  }

  async removeFromWishlist(
    userId: string,
    { productId }: RemoveFromWishlistDTO,
  ) {
    const userWishlist = await this.wishlistRepository.findOne({
      filters: { userId },
    });

    if (!userWishlist) throw new NotFoundException("Wishlist not found");

    const isProductInWishlist = userWishlist.products.find(
      (product) => product.toString() === productId.toString(),
    );

    if (!isProductInWishlist)
      throw new BadRequestException("Product not in Wishlist");

    return await this.wishlistRepository.updateOne({
      filters: { userId },
      data: { $pull: { products: productId } },
    });
  }

  async deleteAllWishlist(userId: string) {
    const userWishlist = await this.wishlistRepository.findOne({
      filters: { userId },
    });

    if (!userWishlist) throw new NotFoundException("Wishlist not found");

    await this.wishlistRepository.deleteOne({
      filters: { userId },
    });

    return { message: "deleted successfully" };
  }

  async getWishlist(userId: string) {
    const userWishlist = await this.wishlistRepository.findOne({
      filters: { userId },
      populate: [
        {
          path: "products",
          select:
            "name images.secure_url basePrice finalPrice description category",
          populate: [
            {
              path: "category",
              select: "_id name image",
            },
            {
              path: "brand",
              select: "_id name logo",
            },
            {
              path: "subCategory",
              select: "_id name image",
            },
          ],
        },
      ],
      select: ["-userId"],
    });

    if (!userWishlist) return [];

    return userWishlist;
  }
}
