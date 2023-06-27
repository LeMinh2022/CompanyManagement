const permissions = require('../utils/permissions');


const authorize = (resource, method) => {
  return (req, res, next) => {
    // get jobTitle from req
    const { jobTitle } = req.userData;

    // check permissions with jobTitle
    if (permissions[resource][method].includes(jobTitle)) {
      next();
    } else {
      res
          .status(401)
          .json({ message: 'Sorry! You can not access this resource.' });
    }
  };
};
module.exports = authorize;
