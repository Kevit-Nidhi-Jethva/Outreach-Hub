import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { User, UserDocument } from './user.schema';
import {
  WhitelistedToken,
  WhitelistedTokenDocument,
} from '../whitelist/whitelist.schema';
import { Workspace } from '../workspace/workspace.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(WhitelistedToken.name)
    private readonly whitelistModel: Model<WhitelistedTokenDocument>,
    @InjectModel(Workspace.name)
    private readonly workspaceModel: Model<Workspace>,
  ) {}

  private buildUserData(
    name: string,
    email: string,
    password: string,
    role: string,
    createdBy?: string,
    workspaces?: { workspaceId: string; role: 'Editor' | 'Viewer' }[],
  ) {
    return {
      name,
      email,
      password, // hashing handled in schema
      role,
      createdBy: createdBy ? new Types.ObjectId(createdBy) : undefined,
      workspaces: workspaces
        ? workspaces.map((ws) => ({
            workspaceId: new Types.ObjectId(ws.workspaceId),
            role: ws.role,
          }))
        : [],
    };
  }

  async signupUser(
    name: string,
    email: string,
    password: string,
    role: string,
    workspaces?: { workspaceId: string; role: 'Editor' | 'Viewer' }[],
    createdBy?: string,
  ) {
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const userData = this.buildUserData(
      name,
      email,
      password,
      role,
      createdBy,
      workspaces,
    );

    const newUser = new this.userModel(userData);
    return await newUser.save();
  }

  async loginUser(email: string, password: string) {
    const user = await this.userModel.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      workspaces: user.workspaces.map((ws) => ({
        workspaceId: ws.workspaceId.toString(),
        role: ws.role,
      })),
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1d' },
    );

    // Store in whitelist
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    await this.whitelistModel.create({ token, userId: user._id, expiresAt });

    return { message: 'Login successful', token };
  }

  async addUser(
    name: string,
    email: string,
    password: string,
    role: string,
    createdBy?: string,
    workspaces?: { workspaceId: string; role: 'Editor' | 'Viewer' }[],
  ) {
    const userData = this.buildUserData(
      name,
      email,
      password,
      role,
      createdBy,
      workspaces,
    );
    const user = new this.userModel(userData);
    return await user.save();
  }

  async updateUser(
    id: string,
    updateData: Partial<{
      name: string;
      email: string;
      password: string;
      workspaces?: { workspaceId: string; role: 'Editor' | 'Viewer' }[];
    }>,
  ) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (updateData.name) user.name = updateData.name;
    if (updateData.email) user.email = updateData.email;
    if (updateData.password) user.password = updateData.password;

    if (updateData.workspaces) {
      user.workspaces = updateData.workspaces.map((ws) => ({
        workspaceId: new Types.ObjectId(ws.workspaceId),
        role: ws.role,
      }));
    }

    return await user.save();
  }

  async getAllUsers() {
    return this.userModel.find().select('-password');
  }

  async getUserById(id: string) {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async deleteUser(id: string) {
    const deleted = await this.userModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new BadRequestException('User not found');
    }
    return { message: 'User deleted successfully' };
  }

  async logoutUser(token: string) {
    const deleted = await this.whitelistModel.findOneAndDelete({ token });
    if (!deleted) {
      throw new UnauthorizedException(
        'Token not found or already invalidated',
      );
    }
    return { message: 'Logged out successfully' };
  }

  async validateToken(token: string) {
    const record = await this.whitelistModel.findOne({ token });
    if (!record) {
      throw new UnauthorizedException('Token is invalid or expired');
    }

    try {
      const decoded: any = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default_secret',
      );
      return decoded;
    } catch {
      // auto-remove expired/invalid token from whitelist
      await this.whitelistModel.deleteOne({ token });
      throw new UnauthorizedException('Token verification failed');
    }
  }

  async getUserWorkspaces(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('workspaces.workspaceId', 'name');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.workspaces
      .filter((ws) => ws.workspaceId !== null)
      .map((ws) => ({
        workspaceId: (ws.workspaceId as any)._id.toString(),
        name: (ws.workspaceId as any).name,
        role: ws.role,
      }));
  }

  async getUserWorkspacesFromToken(
    workspaces: { workspaceId: string; role: string }[],
  ) {
    const ids = workspaces.map((ws) => ws.workspaceId);

    const workspaceDocs = await this.workspaceModel
      .find({ _id: { $in: ids } }, { name: 1, description: 1 })
      .lean();

    return workspaces.map((ws) => {
      const workspaceDoc = workspaceDocs.find(
        (doc: any) => String(doc._id) === String(ws.workspaceId),
      );
      return {
        workspaceId: ws.workspaceId,
        name: workspaceDoc ? workspaceDoc.name : null,
        role: ws.role,
      };
    });
  }
}
