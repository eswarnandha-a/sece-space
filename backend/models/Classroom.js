const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  branch: { type: String },
  subject: { type: String },
  coverImage: { type: String }
});

module.exports = mongoose.model('Classroom', classroomSchema);
