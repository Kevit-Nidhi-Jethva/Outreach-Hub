export type CampaignStatus = 'Draft' | 'Running' | 'Completed';
export type MessageType = 'Text' | 'Text-Image';

export interface CampaignSentMessage {
  _id?: string;
  contactId: string; // Assuming this will be populated with a Contact object later
  messageContent: string;
  sentAt: string; // ISO Date string
}

export interface Campaign {
  _id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  selectedTags: string[];
  message: {
    type: MessageType;
    text: string;
    imageUrl?: string;
  };
  launchedAt?: string; // ISO Date string
  workspaceId: string;
  createdBy: string; // Assuming this will be populated with a User object later
  messages: CampaignSentMessage[];
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}
