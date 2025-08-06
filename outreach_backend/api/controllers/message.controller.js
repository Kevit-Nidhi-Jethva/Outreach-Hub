const MessageTemplate= require('../models/MessageTemplate');
const Workspace = require('../models/Workspace');

const createMessage = async(req,res)=> {
try {
    const { name, type, message, workspaceId} = req.body;
    const createdBy = req.user.userId;

    const newMessage = new MessageTemplate({
      name,
      type,
      message,
      workspaceId,
      createdBy,
    });

    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
const getAllMessages = async (req, res) => {
  try {
    const adminId = req.user.userId;

    //  Find all workspaces created by the admin
    const workspaces = await Workspace.find({ createdBy: adminId }, '_id');
    const workspaceIds = workspaces.map(ws => ws._id);

    // Find all messages in those workspaces
    const messages = await MessageTemplate.find({ workspaceId: { $in: workspaceIds } });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
const getMessageById = async(req,res)=> {
    try {
    const { id } = req.params;
    const adminId = req.user.userId;

    const message = await MessageTemplate.findById(id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    const workspace = await Workspace.findOne({
      _id: message.workspaceId,
      createdBy: adminId
    });

    if (!workspace) return res.status(403).json({ message: 'Unauthorized access to this message' });

    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const updateMessage = async(req,res)=> {
    try {
    const adminId = req.user.userId;
    const messageId = req.params.id;

    const message = await MessageTemplate.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    // Get the workspace this message belongs to
    const workspace = await Workspace.findById(message.workspaceId);
    if (!workspace || workspace.createdBy.toString() !== adminId.toString()) {
      return res.status(403).json({ message: 'Unauthorized: Not your workspace' });
    }

    const { name, type, message: messageContent } = req.body;

    message.name = name || message.name;
    message.type = type || message.type;
    message.message = {
      text: messageContent?.text || message.message.text,
      imageUrl: messageContent?.imageUrl || message.message.imageUrl,
    };
    message.updatedAt = new Date();

    await message.save();

    res.status(200).json({ message: 'Message updated successfully', data: message });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const deleteMessage = async(req,res)=>{
   try {
    const adminId = req.user.userId;
    const messageId = req.params.id;

    const message = await MessageTemplate.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    // Get the workspace this message belongs to
    const workspace = await Workspace.findById(message.workspaceId);
    if (!workspace || workspace.createdBy.toString() !== adminId.toString()) {
      return res.status(403).json({ message: 'Unauthorized: Not your workspace' });
    }

    await message.deleteOne();

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
module.exports= {createMessage, getAllMessages, getMessageById, updateMessage, deleteMessage};