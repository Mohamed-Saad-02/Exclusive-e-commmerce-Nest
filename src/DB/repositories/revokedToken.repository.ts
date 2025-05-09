import { InjectModel } from "@nestjs/mongoose";
import { BaseRepository } from "../base.service";
import { RevokedToken, RevokedTokenType } from "../models/revokedToken.model";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RevokedTokenRepository extends BaseRepository<RevokedTokenType> {
  constructor(
    @InjectModel(RevokedToken.name)
    private readonly revokedTokenModel: Model<RevokedTokenType>,
  ) {
    super(revokedTokenModel);
  }
}
