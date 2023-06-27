const logger = require('../utils/winstonConfig');
const errorHandler = (err, req, res) => {
  logger.error({ message: `Error: ${err.message}`, userName: req?.userData?.userName });
  res.status(`${err.statusCode}`).json({
    status: err.statusCode,
    message: err.message,
  });
};

module.exports = errorHandler;
