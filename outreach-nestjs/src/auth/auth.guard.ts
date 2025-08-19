// src/auth/guards/auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './public-decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ✅ 1. Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header missing or invalid');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      request.user = payload;

      // ✅ Admin shortcut
      if (payload.isAdmin) {
        request.user = { ...payload, role: 'admin', workspaceId: null };
        return true;
      }

      // ✅ Workspace logic
      const workspaceId =
        request.body?.workspaceId ||
        request.query?.workspaceId ||
        request.params?.workspaceId;

      if (!workspaceId) {
        if (!payload.workspaces || payload.workspaces.length === 0) {
          throw new UnauthorizedException('User has no workspaces assigned');
        }
        const defaultWorkspace = payload.workspaces[0];
        request.user = {
          ...payload,
          role: defaultWorkspace?.role,
          workspaceId: defaultWorkspace?.workspaceId,
        };
      } else {
        const workspaceData = payload.workspaces?.find(
          (w) => w?.workspaceId?.toString() === workspaceId.toString(),
        );
        if (!workspaceData) {
          throw new UnauthorizedException(
            'User does not belong to this workspace',
          );
        }
        request.user = {
          ...payload,
          role: workspaceData?.role,
          workspaceId: workspaceData?.workspaceId,
        };
      }

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
