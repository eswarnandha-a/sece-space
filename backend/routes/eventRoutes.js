const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Create event
router.post('/', eventController.createEvent);

// Get events for classroom
router.get('/classroom/:classroomId', eventController.getClassroomEvents);

// Update event
router.put('/:id', eventController.updateEvent);

// Delete event
router.delete('/:id', eventController.deleteEvent);

module.exports = router;
