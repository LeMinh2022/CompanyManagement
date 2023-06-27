
const logger = require('../utils/winstonConfig');

const validateSchema = (schema) =>{
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      logger.error({ message: `Error: ${error.message}`, userName: req.userData.userName });
      return res.status(400).json({
        message: error.details[0].message,
      });
    } else {
      next();
    }
  };
};

module.exports = validateSchema;
