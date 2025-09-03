import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WhitelistedToken, WhitelistedTokenSchema } from './whitelist.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WhitelistedToken.name, schema: WhitelistedTokenSchema }]),
  ],
  exports: [MongooseModule],
})
export class WhitelistModule {}
