const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();

app.use(cors()); // Allow all origins (for development)
app.use(express.json());

const SECRET_KEY = 'your_secret_key'; // Use a secure value in production

// Dummy users array (replace with DB in production)
const users = [
  { email: 'editor@example.com', password: 'password', role: 'Editor' },
  { email: 'viewer@example.com', password: 'password', role: 'Viewer' },
  // Add more users as needed
];

// Login route (returns JWT and role)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    const token = jwt.sign({ email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '2h' });
    return res.json({ token, role: user.role });
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
});

// JWT authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Example protected route
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is protected data', user: req.user });
});

// Start the server
app.listen(3000, () => console.log('Server running on port 3000'));