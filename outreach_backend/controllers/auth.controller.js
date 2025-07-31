const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    let user = await User.findOne({ email });
    const userCount = await User.countDocuments();

    // If user doesn't exist, create a new one ONLY if first user (admin)
    if (!user) {
      if (userCount === 0) {
        // First user: require workspaceName
        if (!workspaceName) {
          return res.status(400).json({ message: 'Workspace name is required for first user.' });
        }
        // Create admin user first
        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({
          name,
          email,
          password: hashedPassword,
          isAdmin: true,
          workspaces: [],
        });
        await user.save();
        // Create workspace with createdBy set to admin user
        const workspace = new Workspace({ name: workspaceName, createdBy: user._id });
        await workspace.save();
        // Update user with workspace assignment
        user.workspaces.push({ workspaceId: workspace._id, role: 'Admin' });
        await user.save();
      } else {
        // Not first user: registration not allowed here
        return res.status(403).json({ message: 'Only admin can add users. Please contact your admin.' });
      }
    } else {
      // If user exists, compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
      // User can login even if workspaces is empty (admin will assign later)
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        workspaces: user.workspaces,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    console.error('Login error stack:', error.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { loginUser };
