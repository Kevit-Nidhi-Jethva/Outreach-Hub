// src/auth/guards/auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './public-decorator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WhitelistedToken,
  WhitelistedTokenDocument,
} from '../whitelist/whitelist.schema';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    @InjectModel(WhitelistedToken.name)
    private readonly whitelistModel: Model<WhitelistedTokenDocument>,
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
      throw new ForbiddenException('Authorization header missing or invalid');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // ✅ Check if token is whitelisted
      const record = await this.whitelistModel.findOne({ token });
      if (!record) {
        throw new ForbiddenException('Token is invalid or expired');
      }

      // Attach payload to request
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
        // no workspace needed, keep payload as is
        return true;
      }

      const workspaceData = payload.workspaces?.find(
        (w) => String(w?.workspaceId) === String(workspaceId),
      );

      if (!workspaceData) {
        throw new ForbiddenException(
          'User does not belong to this workspace',
        );
      }

      request.user = {
        ...payload,
        role: workspaceData?.role,
        workspaceId: workspaceData?.workspaceId,
      };

      return true;
    } catch {
      throw new ForbiddenException('Invalid or expired token');
    }
  }
}
