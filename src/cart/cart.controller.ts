import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  Res,
} from "@nestjs/common";
import { CartService } from "./cart.service";
import { AuthCompose, User } from "src/common/decorators";
import { AddToCartDTO, RemoveFromCartDTO, UpdateCartDTO } from "./DTO/cart.dto";
import { Response } from "express";

@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @AuthCompose()
  async addToCart(
    @Body() body: AddToCartDTO,
    @User("_id") userId: string,
    @Res() res: Response,
  ) {
    const result = await this.cartService.addToCart(userId, body);
    res.status(HttpStatus.CREATED).json(result);
  }

  @Delete()
  @AuthCompose()
  async removeFromCart(
    @Body() body: RemoveFromCartDTO,
    @User("_id") userId: string,
    @Res() res: Response,
  ) {
    const result = await this.cartService.removeFromCart(userId, body);
    res.status(HttpStatus.OK).json(result);
  }

  @Delete("delete-all")
  @AuthCompose()
  async deleteAllCart(@User("_id") userId: string, @Res() res: Response) {
    const result = await this.cartService.deleteAllCart(userId);
    res.status(HttpStatus.OK).json(result);
  }

  @Get()
  @AuthCompose()
  async getCart(@User("_id") userId: string, @Res() res: Response) {
    const result = await this.cartService.getCart(userId);
    res.status(HttpStatus.OK).json(result);
  }

  @Patch()
  @AuthCompose()
  async updateCart(
    @Body() body: UpdateCartDTO,
    @User("_id") userId: string,
    @Res() res: Response,
  ) {
    const result = await this.cartService.updateCart(userId, body);
    res.status(HttpStatus.OK).json(result);
  }
}
