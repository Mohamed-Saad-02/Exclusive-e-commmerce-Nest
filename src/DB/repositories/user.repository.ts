import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "../base.service";
import { User, UserKeysType, UserType } from "../models";

@Injectable()
export class UserRepository extends BaseRepository<UserType> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserType>,
  ) {
    super(userModel);
  }

  async findByEmail(
    email: string,
    select?: (keyof UserKeysType)[] | string[],
  ): Promise<UserType | null> {
    return this.findOne({
      filters: { email, isDeleted: false },
      select: select?.join(" "),
    });
  }
}
