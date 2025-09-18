export type CampaignStatus = 'Draft' | 'Running' | 'Completed';

export interface CampaignMessage {
  type: 'Text' | 'Text-Image';
  text: string;
  imageUrl?: string;
}

export interface CampaignSentMessage {
  contactId?: string;
  messageContent?: string;
  sentAt?: string;
}

export interface Campaign {
  _id?: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  selectedTags: string[];
  message: CampaignMessage;
  workspaceId?: string;
  createdAt?: string;
  launchedAt?: string;
  messages?: CampaignSentMessage[];
}
