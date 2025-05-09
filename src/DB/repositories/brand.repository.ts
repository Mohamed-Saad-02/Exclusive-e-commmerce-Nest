import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../base.service";
import { Brand, BrandDocument } from "../models";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class BrandRepository extends BaseRepository<BrandDocument> {
  constructor(
    @InjectModel(Brand.name)
    private readonly brandModel: Model<BrandDocument>,
  ) {
    super(brandModel);
  }
}
