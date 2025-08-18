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
import { AuthGuard } from './auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import mongoose from 'mongoose';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL!),
    UserModule, 
    ContactModule, 
    MessageModule, 
    WorkspaceModule, 
    CampaignModule,  WhitelistModule, AuthModule, ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
