const Customer = require('../models/customer.model');
const Employee = require('../models/employee.model');
const logger = require('../utils/winstonConfig');
const appError = require('../utils/appError');

const crud = {
  checkID: (req, res, next) => {
    const id = Number(req.params.id);
    if (id < 0) {
      return next(new appError('This ID is invalid', 403));
    }
    next();
  },

  // #region function to get all customer
  getAllCustomers: async (req, res, next) => {
    try {
      // get data from req
      const { officeCode, jobTitle, employeeNumber } = req.userData;

      // check permissions with leader staff
      if (jobTitle == 'staff') {
        //  get all customer have saleRapEmployeeNumber like employeeNumber
        const listCustomers = await Customer.findAll({
          where: { saleRapEmployeeNumber: employeeNumber },
        });
        if (!listCustomers) {
          return next(new appError('Have no customer infor', 400));
        }
        logger.info({
          message: 'get all customer infor successfully',
          userName: req.userData.userName,
        });
        return res.status(200).json({
          message: 'succeed in get all customer infor',
          listCustomers,
        });
      }

      // check permissions with leader
      if (jobTitle == 'leader') {
        // find the list of employee have right officeCode
        const listEmployee = await Employee.findAll({ where: { officeCode } });
        if (!listEmployee) {
          return next(
            new appError(
              `can not find list of employee with officeCode ${officeCode} `,
              400
            )
          );
        }
        // get id from the list of employee
        const idEmployee = listEmployee.map(
          (item) => item.dataValues?.employeeNumber
        );

        // get all customer have the employee id
        const listCustomer = await Customer.findAll({
          where: {
            saleRapEmployeeNumber: idEmployee,
          },
        });

        if (!listCustomer) {
          return next(new appError('can not find list of customer', 400));
        }
        logger.info({
          message: 'get all customer infor successfully',
          userName: req.userData.userName,
        });
        return res.status(200).json({
          message: 'succeed in get all customer infor',
          listCustomer,
        });
      }

      // get all customer
      const allCustomer = await Customer.findAll();
      if (!allCustomer) {
        return next(new appError('can not find list of customer', 400));
      }
      logger.info({
        message: 'get all customer infor successfully',
        userName: req.userData.userName,
      });
      res.status(200).json({
        message: 'succeed in get all customer infor',
        allCustomer,
      });
    } catch (err) {
      next(err);
    }
  },

  // #endregion

  // #region function create new customer
  createCustomer: async (req, res, next) => {
    try {
      // get data from req
      const newCustomer = req.body;

      // get data from req in midleware
      const { officeCode, jobTitle, employeeNumber } = req.userData;

      //  check permissions with leader staff
      if (jobTitle == 'staff') {
        // get newSaleRapEmployeeNumber from newCustomer in req.body
        const newSaleRapEmployeeNumber = newCustomer.saleRapEmployeeNumber;

        // check if newSaleRapEmployeeNumber is equal to employeeNumber
        if (!newSaleRapEmployeeNumber) {
          return next(
            new appError(
              'Sorry but you request do not have saleRapEmployeeNumber',
              403
            )
          );
        }

        // check if the employeeNumber in req is equal to the employeeNumber in req.userData
        if (!(newSaleRapEmployeeNumber == employeeNumber)) {
          return next(
            new appError(
              'You do not have permission to create new customer whom you do not manage',403
            )
          );
        }

        await Customer.create(newCustomer);
        logger.info({
          message: 'create new customer infor successfully',
          userName: req.userData.userName,
        });
        return res.status(200).json({
          message: 'Succeed in creating new customers',
          newCustomer,
        });
      }

      // check permissions with leader leader
      if (jobTitle == 'leader') {
        // take saleRapEmployeeNumber from customer infor in req
        const newSaleRapEmployeeNumber = newCustomer.saleRapEmployeeNumber;

        // get employee
        const employee = await Employee.findOne({
          where: { employeeNumber: newSaleRapEmployeeNumber },
        });
        console.log(employee);

        // check if employee null
        if (!employee) {
          return next(new appError('Sorry, but the employee does not exist', 403));
        }

        // check officeCode
        if (!(officeCode == employee.dataValues.officeCode)) {
          return next(
            new appError(
              'You do not have permissionto create new customer who dont have the same office',
              403
            )
          );
        }

        const createCustomer = await Customer.create(newCustomer);

        if (!createCustomer) {
          return next(new appError('can not create new customer', 403));
        }
        logger.info({
          message: 'create new customer infor successfully',
          userName: req.userData.userName,
        });
        return res.status(200).json({
          message: 'Succeed in creating new customers',
          newCustomer,
        });
      }
      const result = await Customer.create(newCustomer);
      if (!result) {
        return next(new appError('can not create new customer', 403));
      }
      logger.info({
        message: 'create new customer infor successfully',
        userName: req.userData.userName,
      });
      res.status(200).json({
        message: 'Succeed in creating new customers',
        result,
      });
    } catch (err) {
      next(err);
    }
  },
  // #endregion

  // #region function to get infor by id
  getCustomerById: async (req, res, next) => {
    try {
      // get data from req
      const { officeCode, jobTitle, employeeNumber } = req.userData;

      const id = req.params.id;

      // check if id exists
      if (!id) {
        return next(new appError('Please provide id', 400));
      }

      //  check permissions with leader staff
      if (jobTitle == 'staff') {
        // check id
        if (!(id == employeeNumber)) {
          return next(
            new appError(
              'You do not have permission to get this customer information',
              400
            )
          );
        }
        //  get all customer have saleRapEmployeeNumber like employeeNumber
        const customerInfor = await Customer.findByPk(id);
        if (!customerInfor) {
          return next(new appError(`Customer with id: ${id} not found`, 400));
        }
        logger.info({
          message: 'get customer infor successfully',
          userName: req.userData.userName,
        });
        return res.status(200).json({
          message: `succeed in get customer infor with id: ${id}`,
          customerInfor,
        });
      }

      // check permissions with leader
      if (jobTitle == 'leader') {
        // find the list of employee have right officeCode
        const employee = await Employee.findOne({
          where: { employeeNumber: id },
        });

        // check employee exists
        if (!employee) {
          return next(
            new appError('Employee not found, so you cant continue', 403)
          );
        }

        // get officeCode from employee
        const officeCodeOfEmployee = employee.officeCode;

        // check officeCode
        if (officeCode != officeCodeOfEmployee) {
          return next(
            new appError(
              'You do not have permission to get this customer information',
              403
            )
          );
        }

        // get customer by id after check officeCode
        const customerInfor = await Customer.findByPk(id);
        if (!customerInfor) {
          return next(new appError(`Customer with id: ${id} not found`, 403));
        }
        logger.info({
          message: 'get customer infor successfully',
          userName: req.userData.userName,
        });
        return res.status(200).json({
          message: `succeed in get customer infor with id: ${id}`,
          customerInfor,
        });
      }

      // get customer infor by id
      const customerInfor = await Customer.findByPk(id);
      if (!customerInfor) {
        return next(new appError(`Customer with id: ${id} not found`, 403));
      }
      logger.info({
        message: 'get customer infor successfully',
        userName: req.userData.userName,
      });
      return res.status(200).json({
        message: `succeed in get customer infor with id: ${id}`,
        customerInfor,
      });
    } catch (err) {
      next(err);
    }
  },
  // #endregion

  // #region funtion to update infor
  updateCustomerById: async (req, res, next) => {
    try {
      // get data from req
      const { officeCode, jobTitle, employeeNumber } = req.userData;

      // get updateCustomer infor
      const updateCustomerInfor = req.body;

      // check req body infor
      if (!updateCustomerInfor) {
        return next(new appError('Please enter customer infor to update', 403));
      }

      // get id from params
      const id = req.params.id;

      // check if id exists
      if (!id) {
        return next(new appError('Please provide id', 403));
      }

      //  check permissions with leader staff
      if (jobTitle == 'staff') {
        // check id
        if (!(id == employeeNumber)) {
          return next(
            new appError(
              'You do not have permission to get this customer information',
              403
            )
          );
        }
        //  get all customer have saleRapEmployeeNumber like employeeNumber
        const customerInfor = await Customer.findByPk(id);
        if (!customerInfor) {
          return next(new appError(`Customer with id: ${id} not found`, 403));
        }

        // check customer
        if (!customerInfor) {
          return next(new appError(`Customer with id: ${id} not found`, 403));
        }

        // update customer
        const updateCus = customerInfor.update(updateCustomerInfor);
        if (!updateCus) {
          return next(new appError('can not update customer infor', 403));
        }
        logger.info({
          message: 'Update customer infor successfully',
          userName: req.userData.userName,
        });
        return res.status(200).json({
          message: `succeed in get customer infor with id: ${id}`,
          customerInfor,
        });
      }

      // check permissions with leader
      if (jobTitle == 'leader') {
        // find the list of employee have right officeCode
        const employee = await Employee.findOne({
          where: { employeeNumber: id },
        });

        // check employee exists
        if (!employee) {
          return next(
            new appError('Employee not found, so you cant countinue.', 403)
          );
        }

        // get officeCode from employee
        const officeCodeOfEmployee = employee.officeCode;

        // check officeCode
        if (officeCode != officeCodeOfEmployee) {
          return next(
            new appError(
              'You do not have permission to get this customer information',
              403
            )
          );
        }

        // get customer by id after check officeCode
        const customerInfor = await Customer.findByPk(id);
        if (!customerInfor) {
          return next(new appError(`Customer with id: ${id} not found`, 403));
        }

        // update customer
        const updateCus = customerInfor.update(updateCustomerInfor);
        if (!updateCus) {
          return next(new appError('can not update customer infor', 403));
        }
        logger.info({
          message: 'Update customer infor successfully',
          userName: req.userData.userName,
        });
        return res.status(200).json({
          message: `succeed in get all customer infor with id: ${id}`,
          customerInfor,
        });
      }

      // get customer infor
      const customerInfor = await Customer.findByPk(id);

      if (!customerInfor) {
        return next(new appError(`Customer with id: ${id} not found`, 403));
      }

      // update customer
      const updateCus = customerInfor.update(updateCustomerInfor);
      if (!updateCus) {
        return next(new appError('can not update customer infor', 403));
      }
      logger.info({
        message: 'Update customer infor successfully',
        userName: req.userData.userName,
      });
      return res.status(200).json({
        message: `succeed in get all customer infor with id: ${id}`,
        customerInfor,
      });
    } catch (err) {
      next(err);
    }
  },

  // #endregion

  // #region funtion to delete infor
  deleteCustomer: async (req, res, next) => {
    try {
      // get data from req
      const { officeCode, jobTitle, employeeNumber } = req.userData;

      // get id from params
      const id = req.params.id;

      // check if id exists
      if (!id) {
        return next(new appError('Please provide id', 403));
      }

      //  check permissions with leader staff
      if (jobTitle == 'staff') {
        // check id
        if (!(id == employeeNumber)) {
          return next(
            new appError(
              'You do not have permission to get this customer information',
              403
            )
          );
        }
        //  get all customer have saleRapEmployeeNumber like employeeNumber
        const customerInfor = await Customer.findByPk(id);

        // check customer
        if (!customerInfor) {
          return next(new appError(`Customer with id: ${id} not found`, 403));
        }

        // delete customer
        customerInfor.destroy();
        logger.info({
          message: 'delete customer infor successfully',
          userName: req.userData.userName,
        });
        return res.status(200).json({
          message: `succeed delete customer infor with id: ${id}`,
          customerInfor,
        });
      }

      // check permissions with leader
      if (jobTitle == 'leader') {
        // find the list of employee have right officeCode
        const employee = await Employee.findOne({
          where: { employeeNumber: id },
        });

        // check employee exists
        if (!employee) {
          return next(
            new appError('Employee not found, so you cant countinue.', 403)
          );
        }

        // get officeCode from employee
        const officeCodeOfEmployee = employee.officeCode;

        // check officeCode
        if (officeCode != officeCodeOfEmployee) {
          return next(
            new appError(
              'You do not have permission to get this customer information',
              403
            )
          );
        }

        // get customer by id after check officeCode
        const customerInfor = await Customer.findByPk(id);
        if (!customerInfor) {
          return next(new appError(`Customer with id: ${id} not found`, 403));
        }
        // delete customer
        const delCustomer = customerInfor.destroy();
        if (!delCustomer) {
          return next(new appError('can not delete customer', 403));
        }
        logger.info({
          message: 'delete customer infor successfully',
          userName: req.userData.userName,
        });
        return res.status(200).json({
          message: `succeed in delete customer infor with id: ${id}`,
          customerInfor,
        });
      }

      // get customer infor
      const customerInfor = await Customer.findByPk(id);

      if (!customerInfor) {
        return next(new appError(`Customer with id: ${id} not found`, 403));
      }

      // delete customer
      const delCustomer = customerInfor.destroy();
      if (!delCustomer) {
        return next(new appError('can not delete customer', 403));
      }
      logger.info({
        message: 'delete customer infor successfully',
        userName: req.userData.userName,
      });
      return res.status(200).json({
        message: `succeed in delete customer infor with id: ${id}`,
        customerInfor,
      });
    } catch (err) {
      next(err);
    }
  },
  // #endregion
};

module.exports = crud;
