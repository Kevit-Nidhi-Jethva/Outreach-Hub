const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./api/routes/auth.routes');
const adminRoutes = require('./api/routes/admin.route');
const workspaceRoutes = require('./api/routes/workspace.routes');
const contactRoutes = require('./api/routes/contact.routes');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/workspace', workspaceRoutes);
app.use('/contact',contactRoutes);
module.exports = app;
