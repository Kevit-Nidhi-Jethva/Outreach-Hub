import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { User, UserDocument } from './user.schema';
import { WhitelistedToken, WhitelistedTokenDocument } from '../whitelist/whitelist.schema'; 
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(WhitelistedToken.name) private readonly whitelistModel: Model<WhitelistedTokenDocument>, 
  ) {}

  async signupUser(
    name: string,
    email: string,
    password: string,
    role: string,
    workspaceId?: string,
    createdBy?: string
  ) {
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const newUser = new this.userModel({
      name,
      email,
      password, // hashing handled in schema
      role,
      workspaceId: workspaceId ? new Types.ObjectId(workspaceId) : undefined,
      createdBy: createdBy ? new Types.ObjectId(createdBy) : undefined,
    });

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

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, workspaces: user.workspaces, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1d' }
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
    workspaceId?: string,
    createdBy?: string
  ) {
    const user = new this.userModel({
      name,
      email,
      password, // hashing handled in schema
      role,
      workspaceId: workspaceId ? new Types.ObjectId(workspaceId) : undefined,
      createdBy: createdBy ? new Types.ObjectId(createdBy) : undefined,
    });

    return await user.save();
  }

async updateUser(
  id: string,
  updateData: Partial<{ name: string; email: string; password: string; workspaces?: { workspaceId: string; role: 'Editor' | 'Viewer' }[] }>
) {
  const user = await this.userModel.findById(id);
  if (!user) {
    throw new BadRequestException('User not found');
  }

  // Update basic fields
  if (updateData.name) user.name = updateData.name;
  if (updateData.email) user.email = updateData.email;
  if (updateData.password) user.password = updateData.password; // hashed automatically

  // Update workspaces array if provided
  if (updateData.workspaces) {
    // This will replace the entire workspaces array
    user.workspaces = updateData.workspaces.map(ws => ({
      workspaceId: ws.workspaceId,
      role: ws.role,
    }));
  }

  return await user.save();
}

async getAllUsers() {
  return this.userModel.find().select('-password'); // exclude password
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
      throw new UnauthorizedException('Token not found or already invalidated');
    }

    return { message: 'Logged out successfully' };
  }

  async validateToken(token: string) {
  const record = await this.whitelistModel.findOne({ token });
  if (!record) {
    throw new UnauthorizedException('Token is invalid or expired');
  }

  // decode and verify JWT
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    return decoded; // attach this to request.user
  } catch (err) {
    throw new UnauthorizedException('Token verification failed');
  }
}
}



