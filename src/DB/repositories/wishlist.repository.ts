import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "../base.service";
import { Wishlist, WishlistType } from "../models/wishlist.model";

@Injectable()
export class WishlistRepository extends BaseRepository<WishlistType> {
  constructor(
    @InjectModel(Wishlist.name)
    private readonly wishlistModel: Model<WishlistType>,
  ) {
    super(wishlistModel);
  }
}
