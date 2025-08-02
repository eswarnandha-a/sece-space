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

// Add files to classroom
router.post('/:id/files', classroomController.addFiles);

// Delete file from classroom
router.delete('/:id/files/:fileId', classroomController.deleteFile);

// Add event to classroom
router.post('/:id/events', classroomController.addEvent);

// Archive classroom
router.put('/:id/archive', classroomController.archiveClassroom);

// Delete classroom
router.delete('/:id', classroomController.deleteClassroom);

// Migration: Add codes to existing classrooms
router.post('/migrate/add-codes', classroomController.addCodesToExistingClassrooms);

module.exports = router;
