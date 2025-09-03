import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ContactModule } from './contact/contact.module';
import { MessageModule } from './message/message.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { CampaignModule } from './campaign/campaign.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { WhitelistModule } from './whitelist/whitelist.module';
import { AuthModule } from './auth/auth.module';

import mongoose from 'mongoose';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL!, {
      connectionFactory: (connection) => {
      connection.set('strictQuery', false);
      return connection;
      },
    }),
    UserModule, 
    ContactModule, 
    MessageModule, 
    WorkspaceModule, 
    CampaignModule,  WhitelistModule, AuthModule, ],
  controllers: [],
  providers: [],
})
export class AppModule {}
