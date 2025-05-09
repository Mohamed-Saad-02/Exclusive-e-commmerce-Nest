import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../base.service";
import { Banner, BannerDocument } from "../models/banner.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class BannerRepository extends BaseRepository<BannerDocument> {
  constructor(
    @InjectModel(Banner.name)
    private readonly bannerModel: Model<BannerDocument>,
  ) {
    super(bannerModel);
  }
}
