import { Body, Controller, Post, Get,Put,Param,Delete, Headers , UnauthorizedException, UseGuards} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles-decorator';
import { Public } from 'src/auth/public-decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  @Public()
  @Post('signup')
  async signupUser(
    @Body() body: { 
      name: string; 
      email: string; 
      password: string; 
      role: string; 
      workspaceId?: string; 
      createdBy?: string;
    }
  ) {
    return this.userService.signupUser(
      body.name,
      body.email,
      body.password,
      body.role,
      body.workspaceId,
      body.createdBy
    );
  }
  @Public()
  @Post('login')
  async loginUser(@Body() body: { email: string; password: string }) {
    return this.userService.loginUser(body.email, body.password);
  }

  @Public()
  @Post('logout')
 async logoutUser(@Headers('authorization') authHeader?: string) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('Authorization header missing or invalid');
  }

  const token = authHeader.split(' ')[1];
  return this.userService.logoutUser(token);
}

//admin only routes
  @UseGuards(AuthGuard,RolesGuard)
  @Roles('admin')
  @Post('adduser')
  async addUser(
    @Body() body: { 
      name: string; 
      email: string; 
      password: string; 
      role: string; 
      workspaceId?: string; 
      createdBy?: string;
      workspaces?: { workspaceId: string; role: 'Editor' | 'Viewer' }[];
    }
  ) {
    return this.userService.addUser(
      body.name,
      body.email,
      body.password,
      body.role,
      body.workspaceId,
      body.createdBy,
      body.workspaces
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
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
    @Body() body: Partial<{
      name: string;
      email: string;
      password: string;
      workspaces?: { workspaceId: string; role: 'Editor' | 'Viewer' }[];
    }>
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
