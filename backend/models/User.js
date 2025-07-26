const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['faculty', 'student'], required: true },
  name: { type: String },
  rollNumber: { type: String },
  year: { type: String },
  department: { type: String },
  branch: { type: String },
  phone: { type: String },
  socialLinks: {
    github: { type: String },
    linkedin: { type: String },
    portfolio: { type: String }
  },
  profileImage: { type: String },
  bio: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
