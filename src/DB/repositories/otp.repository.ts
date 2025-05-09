import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { OTPType } from "src/common/types";
import { BaseRepository } from "../base.service";
import { OTP, OTPDocument } from "../models";
import { Hash } from "src/common/security";

interface ICreateOtp {
  otp: string;
  userId: string;
  otpType: OTPType;
  expiredAt?: Date;
}

@Injectable()
export class OtpRepository extends BaseRepository<OTPDocument> {
  constructor(
    @InjectModel(OTP.name)
    private readonly otpModel: Model<OTPDocument>,
  ) {
    super(otpModel);
  }

  async createOtp(data: ICreateOtp) {
    return await this.create({
      ...data,
      otp: Hash(data.otp),
      expiredAt: data.expiredAt || new Date(Date.now() + 1000 * 60 * 10), // 10 minutes
    });
  }
}
