import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { AuthCompose, User } from "src/common/decorators";
import { AddToWishlistDTO, RemoveFromWishlistDTO } from "./DTO/wishlist.dto";
import { WishlistService } from "./wishlist.service";

@Controller("wishlist")
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  @AuthCompose()
  async addToWishlist(
    @Body() body: AddToWishlistDTO,
    @User("_id") userId: string,
    @Res() res: Response,
  ) {
    const result = await this.wishlistService.addToWishlist(userId, body);
    res.status(HttpStatus.CREATED).json(result);
  }

  @Delete()
  @AuthCompose()
  async removeFromWishlist(
    @Body() body: RemoveFromWishlistDTO,
    @User("_id") userId: string,
    @Res() res: Response,
  ) {
    const result = await this.wishlistService.removeFromWishlist(userId, body);
    res.status(HttpStatus.OK).json(result);
  }

  @Delete("delete-all")
  @AuthCompose()
  async deleteAllWishlist(@User("_id") userId: string, @Res() res: Response) {
    const result = await this.wishlistService.deleteAllWishlist(userId);
    res.status(HttpStatus.OK).json(result);
  }

  @Get()
  @AuthCompose()
  async getWishlist(@User("_id") userId: string, @Res() res: Response) {
    const result = await this.wishlistService.getWishlist(userId);
    res.status(HttpStatus.OK).json(result);
  }
}
