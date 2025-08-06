// models/Campaign.js
const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['Draft', 'Running', 'Completed'], default: 'Draft' },
  selectedTags: [{ type: String }],

  message: {
    type: {
      type: String,
      enum: ['Text', 'Text-Image'],
      required: true
    },
    text: { type: String, required: true },
    imageUrl: { type: String } 
  },

  launchedAt: { type: Date },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [
    {
      contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
      messageContent: { type: String },
      sentAt: { type: Date, default: Date.now }
    }
  ],
},
{
  timestamps:true,
});

campaignSchema.index({ workspaceId: 1, status: 1 });

module.exports = mongoose.model('Campaign', campaignSchema);
