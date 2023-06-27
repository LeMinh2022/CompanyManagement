const jwt = require('jsonwebtoken');
const User = require('../models/users.model');
const Employee = require('../models/employee.model');
const appError = require('../utils/appError');
require('dotenv').config();

const checkToken = async (req, res, next) => {
  // get authHeader data
  const authHeader = req.headers.authorization;

  // check authHeader
  if (!authHeader) {
    return next(new appError('your header dont have authHeader ', 403));
  }

  // Get token from authHeader
  const token = authHeader.split(' ')[1];

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const { userName } = decoded;

    // find and get user from userName
    const user = await User.findOne({ where: { userName: userName } });

    // check employeeNumber
    const isEmployee = await Employee.findOne({
      where: { employeeNumber: user.employeeNumber },
    });
    if (!user || !isEmployee) {
      return next(new appError('User information not found when we check token', 403));
    }
    // get emmployee infor to take role
    const role = await Employee.findOne({
      where: { employeeNumber: user.employeeNumber },
    });

    if (role) {
      return next(new appError('role information not found when we check token', 403));
    }

    // return data
    req.userData = {
      userName: user.userName,
      employeeNumber: user.employeeNumber,
      officeCode: role.officeCode,
      jobTitle: role.jobTitle.toLowerCase(),
    };
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: 'Invalid Token' });
  }
};

module.exports = checkToken;
