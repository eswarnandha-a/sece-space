const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroomController');

// Create classroom (Faculty)
router.post('/', classroomController.createClassroom);

// Get classroom by ID
router.get('/:id', classroomController.getClassroomById);

// Get faculty classrooms
router.get('/faculty/:facultyId', classroomController.getFacultyClassrooms);

// Get student classrooms
router.get('/student/:studentId', classroomController.getStudentClassrooms);

// Join classroom by code (Student)
router.post('/join', classroomController.joinClassroom);

module.exports = router;
