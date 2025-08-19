import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { WhitelistedToken, WhitelistedTokenSchema } from '../whitelist/whitelist.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: WhitelistedToken.name, schema: WhitelistedTokenSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // ✅ export service
})
export class UserModule {}
