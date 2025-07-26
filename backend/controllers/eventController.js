const Event = require('../models/Event');

// Create event (Faculty only)
exports.createEvent = async (req, res) => {
  try {
    const { classroom, title, description, date } = req.body;
    
    const event = await Event.create({
      classroom,
      title,
      description,
      date: new Date(date)
    });
    
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get events for a classroom
exports.getClassroomEvents = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const events = await Event.find({ classroom: classroomId })
      .populate('classroom', 'name code')
      .sort({ date: 1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update event (Faculty only)
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date } = req.body;
    
    const event = await Event.findByIdAndUpdate(
      id,
      { title, description, date: new Date(date) },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete event (Faculty only)
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
