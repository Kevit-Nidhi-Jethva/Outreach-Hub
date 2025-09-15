import { MessageType } from './campaign.model';

export interface Template {
  _id: string;
  name: string;
  message: {
    type: MessageType;
    text: string;
    imageUrl?: string;
  };
  workspaceId: string;
}