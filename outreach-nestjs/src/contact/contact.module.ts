import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Contact, ContactSchema } from './contact.schema';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { User, UserSchema } from 'src/user/user.schema'; // ✅ import User schema
import { WhitelistedToken, WhitelistedTokenSchema } from '../whitelist/whitelist.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Contact.name, schema: ContactSchema },
      { name: User.name, schema: UserSchema }, // ✅ register User model
      { name: WhitelistedToken.name, schema: WhitelistedTokenSchema }, // Add WhitelistedToken model
    ]),
  ],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
