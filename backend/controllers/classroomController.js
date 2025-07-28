const Classroom = require('../models/Classroom');
const User = require('../models/User');

// Create classroom (Faculty only)
exports.createClassroom = async (req, res) => {
  try {
    const { name, facultyId, branch, subject, coverImage } = req.body;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const classroom = await Classroom.create({
      name,
      code,
      faculty: facultyId,
      branch,
      subject,
      coverImage
    });
    
    res.status(201).json(classroom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all classrooms for a faculty
exports.getFacultyClassrooms = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const classrooms = await Classroom.find({ faculty: facultyId })
      .populate('faculty', 'email')
      .populate('students', 'email');
    res.json(classrooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all classrooms for a student
exports.getStudentClassrooms = async (req, res) => {
  try {
    const { studentId } = req.params;
    const classrooms = await Classroom.find({ students: studentId })
      .populate('faculty', 'email')
      .populate('students', 'email');
    res.json(classrooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Join classroom by code (Student only)
exports.joinClassroom = async (req, res) => {
  try {
    const { code, studentId } = req.body;
    
    const classroom = await Classroom.findOne({ code });
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    
    if (classroom.students.includes(studentId)) {
      return res.status(400).json({ message: 'Already joined this classroom' });
    }
    
    classroom.students.push(studentId);
    await classroom.save();
    
    res.json({ message: 'Successfully joined classroom', classroom });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get classroom by ID
exports.getClassroomById = async (req, res) => {
  try {
    const { id } = req.params;
    const classroom = await Classroom.findById(id)
      .populate('faculty', 'email')
      .populate('students', 'email');
    
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    
    res.json(classroom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
