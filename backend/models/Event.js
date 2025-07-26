const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true }
});

module.exports = mongoose.model('Event', eventSchema);
