import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CartRepository } from "src/DB/repositories";
import { AddToCartDTO, RemoveFromCartDTO, UpdateCartDTO } from "./DTO/cart.dto";
import { Types } from "mongoose";

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async addToCart(userId: string, product: AddToCartDTO) {
    const storedProduct = await this.cartRepository.validateProduct(product);

    const newProduct = {
      productId: storedProduct._id as Types.ObjectId,
      quantity: product.quantity,
      finalPrice: storedProduct.finalPrice * product.quantity,
    };

    const userCart = await this.cartRepository.findOne({ filters: { userId } });

    if (!userCart)
      return this.cartRepository.create({ userId, products: [newProduct] });

    const isProductInCart = userCart.products.find(
      (product) => product.productId === newProduct.productId,
    );

    if (isProductInCart)
      throw new BadRequestException("Product already in cart");

    return await this.cartRepository.updateOne({
      filters: { userId },
      data: { $push: { products: newProduct } },
    });
  }

  async removeFromCart(userId: string, product: RemoveFromCartDTO) {
    const userCart = await this.cartRepository.findOne({
      filters: { userId },
    });

    if (!userCart) throw new NotFoundException("Cart not found");

    const isProductInCart = userCart.products.find(
      (product) => product.productId === product.productId,
    );

    if (!isProductInCart) throw new BadRequestException("Product not in cart");

    return await this.cartRepository.updateOne({
      filters: { userId },
      data: { $pull: { products: { productId: product.productId } } },
    });
  }

  async deleteAllCart(userId: string) {
    const userCart = await this.cartRepository.findOne({
      filters: { userId },
    });

    if (!userCart) throw new NotFoundException("Cart not found");

    await this.cartRepository.deleteOne({
      filters: { userId },
    });

    return { message: "deleted successfully" };
  }

  async getCart(userId: string) {
    const userCart = await this.cartRepository.findOne({
      filters: { userId },
      populate: [
        {
          path: "products.productId",
          select:
            "name images.secure_url basePrice finalPrice description category",
          populate: [
            {
              path: "category",
              select: "name",
            },
          ],
        },
      ],
      select: ["-userId"],
    });

    if (!userCart) throw new NotFoundException("Cart not found");

    return userCart;
  }

  async updateCart(userId: string, body: UpdateCartDTO) {
    const userCart = await this.cartRepository.findOne({
      filters: { userId },
    });

    if (!userCart) throw new NotFoundException("Cart not found");

    const isProductInCart = userCart.products.find(
      (product) => product.productId.toString() === body.productId.toString(),
    );

    if (!isProductInCart) throw new BadRequestException("Product not in cart");

    const product = await this.cartRepository.validateProduct(body);

    return await this.cartRepository.updateOne({
      filters: { userId },
      data: {
        $set: {
          products: {
            productId: body.productId,
            quantity: body.quantity,
            finalPrice: product.finalPrice * body.quantity,
          },
        },
      },
    });
  }
}
