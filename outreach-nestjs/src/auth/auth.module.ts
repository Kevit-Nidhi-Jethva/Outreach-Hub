import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { WhitelistModule } from '../whitelist/whitelist.module';

@Module({
  imports: [
    JwtModule.register({
      global: true, // ✅ makes JwtService available everywhere
      secret: process.env.JWT_SECRET || 'supersecret', // use env in production
      signOptions: { expiresIn: '1d' },
    }),
    WhitelistModule,
  ],
  providers: [AuthGuard, RolesGuard],
  exports: [AuthGuard, RolesGuard],
})
export class AuthModule {}
