import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { Message, MessageSchema } from './message.schema';
import { Workspace, WorkspaceSchema } from '../workspace/workspace.schema';
import { WhitelistedToken, WhitelistedTokenSchema } from '../whitelist/whitelist.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: WhitelistedToken.name, schema: WhitelistedTokenSchema }, // Add WhitelistedToken model
    ]),
  ],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
