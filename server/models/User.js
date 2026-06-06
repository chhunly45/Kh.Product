const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  phoneNumber: { type: String, trim: true },
  displayName: { type: String, required: true, trim: true },
  role: { type: String, enum: ['user', 'seller', 'admin', 'moderator'], default: 'user' },
  profileImageUrl: { type: String, trim: true },
  bio: { type: String, trim: true },
  location: { type: String, trim: true },
  verified: { type: Boolean, default: false },
  verificationStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
  verificationRequestedAt: { type: Date },
  verificationMessage: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date },
  refreshTokens: [{ type: String }],
  notifications: [
    {
      type: { type: String, default: 'info' },
      title: { type: String, required: true, trim: true },
      message: { type: String, default: '', trim: true },
      link: { type: String, trim: true },
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  preferences: {
    language: { type: String, default: 'km' },
    notifications: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

UserSchema.index({ email: 1 });
UserSchema.index({ displayName: 'text', bio: 'text', location: 'text' });

module.exports = model('User', UserSchema);
