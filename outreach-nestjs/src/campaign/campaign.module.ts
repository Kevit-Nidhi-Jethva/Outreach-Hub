import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Campaign, CampaignSchema } from './campaign.schema';
import { CampaignService } from './campaign.service';
import { CampaignController } from './campaign.controller';
import { WhitelistedToken, WhitelistedTokenSchema } from '../whitelist/whitelist.schema';
import { Contact, ContactSchema } from '../contact/contact.schema';
import { ContactModule } from '../contact/contact.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
      { name: WhitelistedToken.name, schema: WhitelistedTokenSchema }, // Add WhitelistedToken model
      { name: Contact.name, schema: ContactSchema }, // Add ContactModel
    ]),
    ContactModule, // Import ContactModule to provide ContactModel
  ],
  controllers: [CampaignController],
  providers: [CampaignService],
  exports: [CampaignService],
})
export class CampaignModule {}
