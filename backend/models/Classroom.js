const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  branch: { type: String },
  subject: { type: String },
  coverImage: { type: String },
  files: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['pdf', 'image', 'document', 'youtube'], required: true },
    unit: { type: String, required: true },
    description: { type: String },
    uploadDate: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  events: [{
    title: { type: String, required: true },
    description: { type: String },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Classroom', classroomSchema);
