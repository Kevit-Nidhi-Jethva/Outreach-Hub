const express = require('express');
const router = express.Router();
const Workspace = require('../models/Workspace');
const verifyToken = require('../middlewares/verifyToken');

// Create a new workspace (admin use)
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can create workspace' });
    }

    const { name } = req.body;
    const workspace = new Workspace({ name });
    await workspace.save();
    res.status(201).json(workspace);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all workspaces (optional, admin use)
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can view workspaces' });
    }

    const workspaces = await Workspace.find();
    res.json(workspaces);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
