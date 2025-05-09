import { Module } from "@nestjs/common";

import { WishlistModel } from "src/DB/models/wishlist.model";
import { WishlistRepository } from "src/DB/repositories/wishlist.repository";
import { WishlistController } from "./wishlist.controller";
import { WishlistService } from "./wishlist.service";
import { ProductRepository } from "src/DB/repositories";
import { BrandModel, ProductModel } from "src/DB/models";

@Module({
  imports: [WishlistModel, ProductModel],
  controllers: [WishlistController],
  providers: [WishlistService, WishlistRepository, ProductRepository],
})
export class WishlistModule {}
