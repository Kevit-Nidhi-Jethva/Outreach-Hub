const Contact =require('../models/Contact');
const mongoose= require('mongoose');

const createContact = async (req, res) => {
 try {
    const { name, phoneNumber, tags, workspaceId } = req.body;

    // Get authenticated user
    const createdBy = req.user.userId;

    // Check if contact already exists in this workspace with same phoneNumber
    const existing = await Contact.findOne({ workspaceId, phoneNumber });
    if (existing) {
      return res.status(409).json({ message: 'Contact already exists with this phone number in the workspace.' });
    }

    // Create and save new contact
    const contact = new Contact({
      name,
      phoneNumber,
      tags,
      workspaceId,
      createdBy
    });

    await contact.save();

    res.status(201).json({
      message: 'Contact created successfully.',
      contact,
    });

  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getContacts = async (req, res) => {
  try {
    const { workspaceId, tag, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (workspaceId) {
      query.workspaceId = new mongoose.Types.ObjectId(workspaceId);
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    console.log("Find Contacts Query:", query);

    const contacts = await Contact.find(query)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    console.log("Found Contacts:", contacts.length);

    res.status(200).json({ success: true, contacts });

  } catch (err) {
    console.error('Get Contacts Error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// View Single Contact
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    res.status(200).json({ success: true, contact });

  } catch (err) {
    console.error('Get Contact By ID Error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Update Contact
const updateContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    // Only creator can update (or you can customize this rule)
    if (contact.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { name, phoneNumber, tags } = req.body;

    if (name) contact.name = name;
    if (phoneNumber) contact.phoneNumber = phoneNumber;
    if (tags) contact.tags = tags;

    await contact.save();

    res.status(200).json({ success: true, contact });

  } catch (err) {
    console.error('Update Contact Error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Delete Contact
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    if (contact.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await contact.deleteOne();
    res.status(200).json({ success: true, message: 'Contact deleted' });

  } catch (err) {
    console.error('Delete Contact Error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
module.exports= {createContact, getContacts, getContactById, updateContact, deleteContact};