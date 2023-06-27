const winston = require('winston');
const LogModel = require('../models/loggerModel');

// function to create customer data in Mongoose
const createMongooseFormat = winston.format((info) => {
  // check to save to MongoDB if the evn is production
  if (process.env.NODE_ENV !== 'test') {
    const { level, message, timestamp, userName } = info;
    // Create log entry in Mongoose
    const logEntry = new LogModel({
      level,
      message,
      userName,
      timestamp,
    });
    logEntry.save().catch((error) => {
      console.error('Failed to save log entry:', error);
    });
  }
  return info;
});

// Custom format for console output
const customConsoleFormat = winston.format.printf(
    ({ level, message, timestamp, userName }) => {
      return `${timestamp} [${level}] ${
      userName ? userName : 'undefined'
      }: ${message}`;
    },
);
// Create the logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.prettyPrint(),
      createMongooseFormat(),
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.File({ filename: 'info.log', level: 'info' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
      new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            customConsoleFormat,
        ),
      }),
  );
}

module.exports = logger;
