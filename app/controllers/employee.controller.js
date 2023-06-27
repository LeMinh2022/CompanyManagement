const Employee = require('../models/employee.model');
const logger = require('../utils/winstonConfig');
const appError = require('../utils/appError');
const crud = {
  checkID: (req, res, next) => {
    const id = Number(req.params.id);
    if (id < 0) {
      return next(new appError('this ID invalid', 403));
    }
    next();
  },

  // #region function to get all employees
  getAllEmployees: async (req, res, next) => {
    try {
      // get list of employees infor
      const employees = await Employee.findAll();

      // check employees
      if (employees.length === 0) {
        return next(new appError('no employee found', 403));
      }

      logger.info({
        message: 'get all employees infor successfully',
        userName: req.userData.userName,
      });

      res.status(200).json({
        message: 'succes',
        employees,
      });
    } catch (error) {
      next(error);
    }
  },
  // #endregion

  // #region function to create employee
  createEmployee: async (req, res, next) => {
    try {
      // get employee information
      const employee = req.body;

      // check employees
      if (!employee) {
        return next(
          new appError('Please enter employee infor to create new', 403)
        );
      }
      // create new employee
      const createEmp = await Employee.create(employee);
      if (!createEmp) {
        return next(new appError('Cannot create new employee', 403));
      }

      logger.info({
        message: 'create new employees  successfully',
        userName: req.userData.userName,
      });
      res.status(200).json({
        message: 'success to create new employee',
        employee,
      });
    } catch (error) {
      logger.error({
        message: `Error creating employee: ${error.message}`,
        userName: req.userData.userName,
      });
      next(error);
    }
  },
  // #endregion

  // #region function to get infor by id
  getEmployeeById: async (req, res, next) => {
    try {
      // get id from params
      const id = req.params.id;

      // get employee by id

      const employee = await Employee.findByPk(id);
      // check if employee is found
      
      if (!employee) {
        return next(new appError(`Cannot find employee with id: ${id}`, 403));
      }

      logger.info({
        message: 'get employees infor successfully',
        userName: req.userData.userName,
      });
      // return employee information
      res.status(200).json({
        message: 'success',
        employee,
      });
    } catch (error) {
      next(error);
    }
  },
  // #endregion

  // #region funtion to update infor
  updateEmployeeById: async (req, res, next) => {
    try {
      // get employee information
      const updateEmployee = req.body;

      // check updateEmployee

      if (!updateEmployee) {
        return next(new appError('Please enter employee information to update', 403));
      }

      // get id from params
      const id = req.params.id;

      // get employee by id
      const employee = await Employee.findByPk(id);

      // check if employee is found
      if (!employee) {
        return next(new appError(`Cannot find employee with id ${id}`, 403));
      }

      // update employee information
      const updateEmp = await Employee.update(updateEmployee);
      if (!updateEmp) {
        return next(new appError('Cannot update employee', 403));
      }
      logger.info({
        message: 'update employee infor successfully',
        userName: req.userData.userName,
      });
      // return employee information
      res.status(200).json({
        message: `success to update employee with id: ${id}`,
        employee: updateEmp,
      });
    } catch (error) {
      next(error);
    }
  },
  // #endregion

  // #regionfuntion to delete infor
  deleteEmployee: async (req, res, next) => {
    try {
      // get id from params
      const id = req.params.id;

      // get employee by id
      const employee = await Employee.findByPk(id);

      // check if employee is found

      if (!employee) {
        return next(new appError(`Cannot find employee with id: ${id}`, 403));
      }

      // delete employee
      const deleteEmp = await Employee.destroy();
      if (!deleteEmp) {
        return next(new appError('Cannot delete employee', 403));
      }

      logger.info({
        message: 'delete employee successfully',
        userName: req.userData.userName,
      });
      // return employee information
      res.status(200).json({
        message: `success to delete employee with id: ${id}`,
        employee,
      });
    } catch (error) {
      next(error);
    }
  },
  // #endregion
};

module.exports = crud;
