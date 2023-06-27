const User = require('../models/users.model');
const Employee = require('../models/employee.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../utils/winstonConfig');
const AppError = require('../utils/appError');
require('dotenv').config();
const auth = {
  // # start register user function
  register: async (req, res, next) => {
    try {
      // get data from request body
      const { username, password, employeenumber } = req.body;
      // check request data
      if (!username || !password || !employeenumber) {
        return next(
          new AppError(
            'Please provide username, password and employee number',
            400
          )
        );
      }
      // Check if the username is not the same
      const existingUser = await User.findOne({
        where: { userName: username },
      });
      if (existingUser) {
        return next(new AppError('Your username has been duplicated', 400));
      }
      // check if employeenumber exists
      const checkEmployeeNumber = await Employee.findOne({
        where: { employeeNumber: employeenumber },
      });

      if (!checkEmployeeNumber) {
        return next(new AppError('Your employee Number does not exist', 400));
      }

      // check employeenumber unique in user table
      const checkEmployeeNumberUnique = await User.findOne({
        where: { employeeNumber: employeenumber },
      });

      if (checkEmployeeNumberUnique) {
        return next(
          new AppError('Your employee number has been duplicated', 400)
        );
      }
      // creat salt with bcrypt (random salt)
      const salt = await bcrypt.genSalt();
      const hashPass = await bcrypt.hash(password, salt);
      // create new user
      const newUser = await User.create({
        userName: username,
        password: hashPass,
        employeeNumber: employeenumber,
      });

      // chech error when create user
      if (!newUser) {
        return next(new AppError('User not created', 400));
      }

      // create token for user
      const token = jwt.sign({ username }, process.env.JWT_KEY);

      logger.info({
        message: 'registered successfully',
        userName: username,
      });
      // response to user
      return res.status(201).json({
        message: 'User registered successfully',
        user: {
          username: newUser.userName,
          employeenumber: newUser.employeeNumber,
        },
        token,
      });
    } catch (err) {
      next(err);
    }
  },
  // # end register user funtion

  // # Start login user function
  login: async (req, res, next) => {
    try {
      // get data from request body
      const { userName, password } = req.body;

      if (!userName || !password) {
        return next(new AppError('Please provide username, password.', 400));
      }

      // check user name
      const user = await User.findOne({ where: { userName } });
      if (!user) {
        return next(new AppError('User not found', 400));
      }
      // check password

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return next(new AppError('Invalid password', 422));
      }

      // create JWT token
      const token = jwt.sign({ userName }, process.env.JWT_KEY);

      logger.info({
        message: 'login successfully',
        userName: userName,
      });
      // response to user
      res.status(200).json({
        message: 'User logged in successfully',
        user: {
          userName: user.userName,
          employeeNumber: user.employeeNumber,
        },
        token,
      });
    } catch (err) {
      next(err);
    }
  },
};
// # end login user function

module.exports = auth;
