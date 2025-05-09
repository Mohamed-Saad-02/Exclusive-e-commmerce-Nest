import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CompareHashed } from "src/common/security";
import { UserKeysType } from "src/DB/models";
import { UserRepository } from "src/DB/repositories";
import { ChangePasswordDto, UpdateProfileDto } from "./DTO/user.dto";
import { QueryOptionsDto } from "src/common/DTO";
import { mapperFilter } from "src/common/utils";

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async meService(user: UserKeysType) {
    const { _id, firstName, lastName, email, phone, DOB } = user;

    return {
      _id,
      firstName,
      lastName,
      email,
      phone,
      DOB,
    };
  }

  async changePasswordService(userId: string, body: ChangePasswordDto) {
    const { oldPassword, newPassword } = body;

    const user = await this.userRepository.findOne({
      filters: { _id: userId, isVerified: true, isDeleted: false },
      select: ["+password"],
    });

    // If the user is not found, throw an error
    if (!user) throw new NotFoundException("User not found");

    const isPasswordValid = CompareHashed(oldPassword, user.password);
    if (!isPasswordValid) throw new BadRequestException("Invalid old password");

    user.password = newPassword;

    // Update user password
    await this.userRepository.save(user);

    // Return success message
    return {
      message: "Password changed successfully",
    };
  }

  async updateProfileService(userId: string, body: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      filters: { _id: userId, isVerified: true, isDeleted: false },
    });

    if (!user) throw new NotFoundException("User not found");

    user.firstName = body.firstName || user.firstName;
    user.lastName = body.lastName || user.lastName;
    user.email = body.email || user.email;
    user.phone = body.phone || user.phone;
    user.DOB = body.DOB || user.DOB;

    await this.userRepository.save(user, { validateBeforeSave: false });

    return {
      message: "Profile updated successfully",
    };
  }

  async getAllService(query: QueryOptionsDto) {
    const { limit = 10, page = 1, sort, ...filter } = query;
    const skip = (page - 1) * limit;

    const filters = mapperFilter(filter);

    const users = await this.userRepository.find({
      filters,
      skip,
      limit,
      sort,
    });

    return {
      metadata: {
        page,
        limit,
        result: users.length,
      },
      users,
    };
  }

  async getOneService(userId: string) {
    const user = await this.userRepository.findOne({
      filters: { _id: userId },
    });

    if (!user) throw new NotFoundException("User Not Found");

    return user;
  }

  async deleteOneService(userId: string) {
    const user = await this.userRepository.findOne({
      filters: { _id: userId, isDeleted: false, isVerified: true },
    });

    if (!user) throw new NotFoundException("User Not Found");

    await this.userRepository.updateOne({
      filters: { _id: user._id },
      data: { isDeleted: true },
    });

    return { message: "User Deleted Successfully" };
  }
}
