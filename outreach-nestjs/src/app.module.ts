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
    MongooseModule.forRoot(process.env.MONGO_URL!),
    UserModule, 
    ContactModule, 
    MessageModule, 
    WorkspaceModule, 
    CampaignModule,  WhitelistModule, AuthModule, ],
  controllers: [],
  providers: [],
})
export class AppModule {
  async onModuleInit() {
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
  }
}
