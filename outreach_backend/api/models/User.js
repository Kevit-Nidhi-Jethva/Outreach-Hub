const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phoneNumber: { type: String, required: false, trim: true },
    password: { type: String, required: true },

    // First user will have this true; others false
    isAdmin: { type: Boolean, default: false },

    // Workspaces with role per workspace
    workspaces: [
      {
        workspaceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Workspace',
          required: false,
        },
        role: {
          type: String,
          enum: ['Editor', 'Viewer'],
          required: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 👉 Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', userSchema);
