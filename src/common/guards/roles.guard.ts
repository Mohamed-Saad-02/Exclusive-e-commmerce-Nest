import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { UserRole } from "../types";
import { Roles } from "../decorators";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userRole = request.authUser.user.role;

    const requiredRoles = this.reflector.get<UserRole[]>(
      Roles,
      context.getHandler(),
    );

    if (!requiredRoles) return true;

    return requiredRoles.some((role) => userRole === role);
  }
}
