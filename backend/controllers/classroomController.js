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
      .populate('faculty', 'name email')
      .populate('students', 'name email');
    
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    
    res.json(classroom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add files to classroom
exports.addFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const { files } = req.body;
    
    const classroom = await Classroom.findById(id);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    
    // Add files to classroom
    classroom.files.push(...files);
    await classroom.save();
    
    res.json({ message: 'Files added successfully', files: classroom.files });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete file from classroom
exports.deleteFile = async (req, res) => {
  try {
    const { id, fileId } = req.params;
    
    const classroom = await Classroom.findById(id);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    
    // Remove file from classroom
    classroom.files = classroom.files.filter(file => file._id.toString() !== fileId);
    await classroom.save();
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add event to classroom
exports.addEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date } = req.body;
    
    const classroom = await Classroom.findById(id);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    
    const newEvent = {
      title,
      description,
      date,
      createdAt: new Date()
    };
    
    classroom.events.push(newEvent);
    await classroom.save();
    
    // Return the newly added event
    const addedEvent = classroom.events[classroom.events.length - 1];
    res.json(addedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Archive classroom
exports.archiveClassroom = async (req, res) => {
  try {
    const { id } = req.params;
    
    const classroom = await Classroom.findByIdAndUpdate(
      id,
      { isArchived: true },
      { new: true }
    );
    
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    
    res.json({ message: 'Classroom archived successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete classroom
exports.deleteClassroom = async (req, res) => {
  try {
    const { id } = req.params;
    
    const classroom = await Classroom.findByIdAndDelete(id);
    
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    
    res.json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Migration function to add codes to existing classrooms
exports.addCodesToExistingClassrooms = async (req, res) => {
  try {
    const classroomsWithoutCode = await Classroom.find({ 
      $or: [
        { code: { $exists: false } },
        { code: null },
        { code: '' }
      ]
    });
    
    const updatePromises = classroomsWithoutCode.map(classroom => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      return Classroom.findByIdAndUpdate(classroom._id, { code });
    });
    
    await Promise.all(updatePromises);
    
    res.json({ 
      message: `Updated ${classroomsWithoutCode.length} classrooms with codes`,
      count: classroomsWithoutCode.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
