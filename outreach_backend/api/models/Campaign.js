// models/Campaign.js
const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['Draft', 'Running', 'Completed'], default: 'Draft' },
  selectedTags: [{ type: String }],
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'MessageTemplate' },
  launchedAt: { type: Date },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Messages sent per contact (for history/audit)
  messages: [
    {
      contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
      messageContent: { type: String },
      sentAt: { type: Date, default: Date.now }
    }
  ],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

campaignSchema.index({ workspaceId: 1, status: 1 });

module.exports = mongoose.model('Campaign', campaignSchema);
