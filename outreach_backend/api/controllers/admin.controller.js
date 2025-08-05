// controllers/adminController.js
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const bcrypt = require('bcryptjs');

exports.addUser = async (req, res) => {
  try {
    // Only admin can add users (checked in middleware)
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isAdmin: false,
      workspaces: [],
    });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error while creating user' });
  }
};

exports.addUserToWorkspace = async (req, res) => {
  try {
    const { email, workspaceId, role } = req.body;
    if (!email || !workspaceId || !role) {
      return res.status(400).json({ message: 'Email, workspaceId, and role are required.' });
    }
    // Only admin can add users
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Only admins can add users to workspaces.' });
    }
    // Check workspace exists
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found.' });
    }
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    // Check if user already in workspace
    const alreadyIn = user.workspaces.some(w => w.workspaceId.toString() === workspaceId);
    if (alreadyIn) {
      return res.status(400).json({ message: 'User already in workspace.' });
    }
    // Add workspace with role
    user.workspaces.push({ workspaceId, role });
    await user.save();
    res.status(200).json({ message: 'User added to workspace', user });
  } catch (error) {
    console.error('Error adding user to workspace:', error);
    res.status(500).json({ message: 'Server error while adding user to workspace' });
  }
};
