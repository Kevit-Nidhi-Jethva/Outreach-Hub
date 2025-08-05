const User = require('../models/User');
const BlacklistedToken = require('../models/BlacklistedToken');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const verifyToken = require('../middlewares/verifyToken');

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
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

const signupUser = async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const newUser = new User({
      name,
      email,
      phoneNumber,
      password,
      isAdmin: true, // Default to false for new users
    });

    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error.message);
    console.error('Signup error stack:', error.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

//admin can add users to database
const addUser = async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.find({ email });

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const newUser = new User({
      name,
      email,
      phoneNumber,
      password,
      isAdmin: false, // Default to false for new users
    });

    await newUser.save();

    res.status(201).json({ message: 'User created successfully' }); 
  } catch (error) {
    console.error('Add user error:', error.message);
    console.error('Add user error stack:', error.stack);
    res.status(500).json({ message: 'Server error' });
  }
};  

const logoutUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer token

    if (!token) {
      return res.status(400).json({ message: 'Token missing' });
    }

    // Decode the token to get expiry
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.exp) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const expiry = new Date(decoded.exp * 1000);

    await BlacklistedToken.create({ token, expiresAt: expiry });

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports = { loginUser , signupUser , addUser, logoutUser};

