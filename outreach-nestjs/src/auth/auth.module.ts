import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule], // ✅ direct import so AuthGuard can inject UserService
  providers: [AuthGuard, RolesGuard],
  exports: [AuthGuard, RolesGuard], // ✅ so ContactModule can use them
})
export class AuthModule {}
