// models/MessageTemplate.js
const mongoose = require('mongoose');

const messageTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Text', 'Text-Image'], required: true },
  message: {
    text: { type: String, required: true },
    imageUrl: { type: String } // only for Text-Image
  },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

messageTemplateSchema.index({ workspaceId: 1, type: 1 });

module.exports = mongoose.model('MessageTemplate', messageTemplateSchema);
