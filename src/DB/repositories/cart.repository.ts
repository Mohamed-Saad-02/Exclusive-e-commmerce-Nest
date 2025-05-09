import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AddToCartDTO } from "src/cart/DTO/cart.dto";
import { BaseRepository } from "../base.service";
import { Cart, cartType, ProductDocument } from "../models";
import { ProductRepository } from "./product.repository";
import { ProductStatus } from "src/common/types";

@Injectable()
export class CartRepository extends BaseRepository<cartType> {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<cartType>,
    private readonly productRepository: ProductRepository,
  ) {
    super(cartModel);
  }

  async validateProduct(product: AddToCartDTO): Promise<ProductDocument> {
    const storedProduct = await this.productRepository.findOne({
      filters: {
        _id: product.productId.toString(),
        status: ProductStatus.ACTIVE,
        stock: { $gte: product.quantity },
      },
    });

    if (!storedProduct) {
      throw new BadRequestException("Product not found or out stock");
    }

    return storedProduct;
  }
}
