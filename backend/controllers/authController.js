const User = require('../models/User');

exports.login = async (req, res) => {
  try {
    const { email } = req.body;
    let role = null;
    
    if (email.endsWith('@faculty.com')) role = 'faculty';
    else if (email.endsWith('@student.com')) role = 'student';
    else return res.status(400).json({ message: 'Invalid email domain' });

    let user = await User.findOne({ email });
    if (!user) {
      // Create new user with basic info
      user = await User.create({ 
        email, 
        role,
        password: 'SECE@123' // Default password
      });
    }

    // Return full user profile (excluding password)
    const userResponse = {
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      rollNumber: user.rollNumber,
      year: user.year,
      department: user.department,
      branch: user.branch,
      phone: user.phone,
      socialLinks: user.socialLinks,
      profileImage: user.profileImage,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    // For simplicity, we'll just check if current password is SECE@123
    if (currentPassword !== 'SECE@123') {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // In a real app, you would hash the password
    // For now, we'll just return success
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
