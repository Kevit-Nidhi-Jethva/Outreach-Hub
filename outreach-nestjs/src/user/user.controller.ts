import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Param,
  Delete,
  Headers,
  UnauthorizedException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles-decorator';
import { Public } from 'src/auth/public-decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ===== Public Routes =====

  @Public()
  @Post('signup')
  async signupUser(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      role: string;
      workspaces?: { workspaceId: string; role: 'Editor' | 'Viewer' }[];
      createdBy?: string;
    },
  ) {
    return this.userService.signupUser(
      body.name,
      body.email,
      body.password,
      body.role,
      body.workspaces,
      body.createdBy,
    );
  }

  @Public()
  @Post('login')
  async loginUser(@Body() body: { email: string; password: string }) {
    return this.userService.loginUser(body.email, body.password);
  }

   @Public()
  @Post('loginadmin')
  async loginAdminUser(@Body() body: { email: string; password: string }) {
    return this.userService.loginAdminUser(body.email, body.password);
  }

  @Public()
  @Post('logout')
  async logoutUser(@Headers('authorization') authHeader?: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Authorization header missing or invalid',
      );
    }

    const token = authHeader.split(' ')[1];
    return this.userService.logoutUser(token);
  }

  @Public()
  @Get('validate-token')
  async validateToken(@Headers('authorization') authHeader?: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Authorization header missing or invalid',
      );
    }
    const token = authHeader.split(' ')[1];
    return this.userService.validateToken(token);
  }

  // ===== Authenticated User Routes =====

  @UseGuards(AuthGuard)
  @Get('my-workspaces')
  async getMyWorkspaces(@Req() req) {
    return this.userService.getUserWorkspacesFromToken(req.user.workspaces);
  }

  // ===== Admin Only Routes =====

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post('adduser')
  async addUser(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      role: string;
      createdBy?: string;
      phoneNumber?: string;
      workspaces?: { workspaceId: string; role: 'Editor' | 'Viewer' }[];
    },
  ) {
    return this.userService.addUser(
      body.name,
      body.email,
      body.password,
      body.role,
      body.createdBy,
      body.phoneNumber,
      body.workspaces
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post('addadmin')
  async addAdmin(
    @Req() req,
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      phoneNumber?: string;
    },
  ) {
    return this.userService.addAdmin(
      req.user.id,
      body.name,
      body.email,
      body.password,
      body.phoneNumber,
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  // @Roles('admin')
  @Get('all')
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      name: string;
      email: string;
      password: string;
      workspaces?: { workspaceId: string; role: 'Editor' | 'Viewer' }[];
    }>,
  ) {
    return this.userService.updateUser(id, body);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
