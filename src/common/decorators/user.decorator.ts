import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  UseGuards,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../types";
import { AuthGuard, RolesGuard } from "../guards";
import { UserKeysType } from "src/DB/models";
import { JwtPayload } from "jsonwebtoken";

type UserDecoratorData = UserKeysType & { token: JwtPayload };

// Get the user from the request
export const User = createParamDecorator(
  (data: keyof UserDecoratorData, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const authUser = request.authUser;

    const user = Object.assign(authUser.user, {
      token: request.authUser.token,
    });

    if (data) return user[data];

    return user;
  },
);

// Create a decorator to set the roles
export const Roles = Reflector.createDecorator<UserRole[]>();

// Compose the auth guard and roles guard
export const AuthCompose = (
  roles: UserRole[] = Object.values(UserRole),
): MethodDecorator => {
  return applyDecorators(Roles(roles), UseGuards(AuthGuard, RolesGuard));
};
