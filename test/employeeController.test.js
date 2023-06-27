const { expect } = require('chai');
const sinon = require('sinon');
const Employee = require('../app/models/employee.model');
const employeeController = require('../app/controllers/employee.controller');
const AppError = require('../app/utils/appError');

describe('employeeController', () => {
    afterEach(()=>{
        sinon.restore()
    })
  describe('checkID', () => {
    it('should call next with error when ID is invalid', () => {
      const req = {
        params: {
          id: -1,
        },
      };
      const res = {};
      const next = sinon.spy();

      employeeController.checkID(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0].message).to.equal('this ID invalid');
      expect(next.firstCall.args[0].statusCode).to.equal(403);
    });

    it('should call next without error when ID is valid', () => {
      const req = {
        params: {
          id: 1,
        },
      };
      const res = {};
      const next = sinon.spy();

      employeeController.checkID(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.be.undefined;
    });
  });

  describe('getAllEmployees', () => {
    it('should return all employees', async () => {
      const req = {
        userData: {},
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
      const next = sinon.spy();

      // Mock Employee.findAll function
      const findAllStub = sinon.stub(Employee, 'findAll').resolves([
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' },
      ]);

      await employeeController.getAllEmployees(req, res, next);

      expect(findAllStub.calledOnce).to.be.true;
      expect(res.status.calledOnce).to.be.true;
      expect(res.status.firstCall.args[0]).to.equal(200);
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.equal({
        message: 'succes',
        employees: [
          { id: 1, name: 'John Doe' },
          { id: 2, name: 'Jane Smith' },
        ],
      });
      expect(next.called).to.be.false;

      findAllStub.restore();
    });

    it('should handle case when no employees are found', async () => {
      const req = {};
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      sinon.stub(Employee, 'findAll').resolves([]);

      const next = sinon.spy();

      await employeeController.getAllEmployees(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0]).to.be.an.instanceOf(AppError);
      expect(next.args[0][0].message).to.equal('no employee found');
      expect(next.args[0][0].statusCode).to.equal(403);

      Employee.findAll.restore();
    });

    it('should handle errors', async () => {
      const req = {};
      const res = {};
      const error = new Error('Database error');
      const next = sinon.spy();

      sinon.stub(Employee, 'findAll').rejects(error);

      await employeeController.getAllEmployees(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0]).to.equal(error);

      Employee.findAll.restore();
    });
  });

  describe('createEmployee', () => {
    it('should create a new employee', async () => {
      const req = {
        userData: {},
        body: {
          name: 'John',
          age: 30,
          department: 'IT',
        },
      };

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      sinon.stub(Employee, 'create').resolves(req.body);

      await employeeController.createEmployee(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith({
          message: 'success to create new employee',
          employee: req.body,
        })
      ).to.be.true;

      Employee.create.restore();
    });

    it('should handle case when no employee information is provided', async () => {
      const req = {
        body: null,
      };
      const res = {};
      const next = sinon.spy();

      await employeeController.createEmployee(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0]).to.be.an.instanceOf(AppError);
      expect(next.args[0][0].message).to.equal(
        'Please enter employee infor to create new'
      );
      expect(next.args[0][0].statusCode).to.equal(403);
    });

    it('should handle case when failed to create a new employee', async () => {
      const req = {
        body: {
          name: 'John',
          age: 30,
          department: 'IT',
        },
      };
      const res = {};
      const next = sinon.spy();

      sinon.stub(Employee, 'create').resolves(null);

      await employeeController.createEmployee(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0]).to.be.an.instanceOf(AppError);
      expect(next.args[0][0].message).to.equal('Cannot create new employee');
      expect(next.args[0][0].statusCode).to.equal(403);

      Employee.create.restore();
    });

    it('should handle errors', async () => {
      const req = {
        userData: {},
        body: {
          name: 'John',
          age: 30,
          department: 'IT',
        },
      };
      const res = {};
      const error = new Error('Database error');
      const next = sinon.spy();

      sinon.stub(Employee, 'create').rejects(error);

      await employeeController.createEmployee(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0]).to.equal(error);

      Employee.create.restore();
    });
  });

  describe('getEmployeeById', () => {
    it('should return the employee with the given ID', async () => {
      const id = 1;
      const req = {
        userData: {},
        params: { id },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      const employee = { id, name: 'John' };

      sinon.stub(Employee, 'findByPk').resolves(employee);

      await employeeController.getEmployeeById(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith({
          message: 'success',
          employee,
        })
      ).to.be.true;

      Employee.findByPk.restore();
    });

    it('should handle case when employee is not found', async () => {
      const id = 1;
      const req = {
        params: { id },
      };
      const res = {};
      const next = sinon.spy();

      sinon.stub(Employee, 'findByPk').resolves(null);

      await employeeController.getEmployeeById(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0]).to.be.an.instanceOf(AppError);
      expect(next.args[0][0].message).to.equal(
        `Cannot find employee with id: ${id}`
      );
      expect(next.args[0][0].statusCode).to.equal(403);

      Employee.findByPk.restore();
    });

    it('should handle errors', async () => {
      const id = 1;
      const req = {
        params: { id },
      };
      const res = {};
      const error = new Error('Database error');
      const next = sinon.spy();

      sinon.stub(Employee, 'findByPk').rejects(error);

      await employeeController.getEmployeeById(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0]).to.equal(error);

      Employee.findByPk.restore();
    });
  });

  describe('updateEmployeeById', () => {
    it('should update the employee with the given ID', async () => {
      const id = 1;
      const updateEmployee = { name: 'John Doe', age: 35 };
      const req = {
        userData:{},
        params: { id },
        body: updateEmployee,
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      const employee = { id, name: 'John', age: 30 };
      sinon.stub(Employee, 'findByPk').resolves(employee);
      sinon.stub(Employee, 'update').resolves(updateEmployee );

      await employeeController.updateEmployeeById(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({
        message: `success to update employee with id: ${id}`,
        employee: updateEmployee ,
      })).to.be.true;

      Employee.findByPk.restore();
      Employee.update.restore();
    });

    it('should handle case when no employee information is provided', async () => {
      const id = 1;
      const req = {
        params: { id },
        body: null,
      };
      const res = {};
      const next = sinon.spy();

      await employeeController.updateEmployeeById(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0]).to.be.an.instanceOf(AppError);
      expect(next.args[0][0].message).to.equal('Please enter employee information to update');
      expect(next.args[0][0].statusCode).to.equal(403);
    });

    it('should handle case when employee is not found', async () => {
      const id = 1;
      const updateEmployee = { name: 'John Doe', age: 35 };
      const req = {
        params: { id },
        body: updateEmployee,
      };
      const res = {};
      const next = sinon.spy();

      sinon.stub(Employee, 'findByPk').resolves(null);

      await employeeController.updateEmployeeById(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0]).to.be.an.instanceOf(AppError);
      expect(next.args[0][0].message).to.equal(`Cannot find employee with id ${id}`);
      expect(next.args[0][0].statusCode).to.equal(403);

      Employee.findByPk.restore();
    });

    it('should handle case when failed to update the employee', async () => {
      const id = 1;
      const updateEmployee = { name: 'John Doe', age: 35 };
      const req = {
        params: { id },
        body: updateEmployee,
      };
      const res = {};
      const next = sinon.spy();

      const employee = { id, name: 'John', age: 30 };
      sinon.stub(Employee, 'findByPk').resolves(employee);
      sinon.stub(Employee, 'update').resolves(null);

      await employeeController.updateEmployeeById(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0]).to.be.an.instanceOf(AppError);
      expect(next.args[0][0].message).to.equal('Cannot update employee');
      expect(next.args[0][0].statusCode).to.equal(403);

      Employee.findByPk.restore();
      Employee.update.restore();
    });

    it('should handle errors', async () => {
      const id = 1;
      const updateEmployee = { name: 'John Doe', age: 35 };
      const req = {
        params: { id },
        body: updateEmployee,
      };
      const res = {};
      const error = new Error('Database error');
      const next = sinon.spy();

      const employee = { id, name: 'John', age: 30 };
      sinon.stub(Employee, 'findByPk').resolves(employee);
      sinon.stub(Employee, 'update').rejects(error);

      await employeeController.updateEmployeeById(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0]).to.equal(error);

      Employee.findByPk.restore();
      Employee.update.restore();
    });
  });

  describe('deleteEmployee', () => {
    it('should delete the employee with the given ID', async () => {
      const id = 1;
      const req = {
        userData: {},
        params: { id },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      const employee = { id, name: 'John' };
      sinon.stub(Employee, 'findByPk').resolves(employee);
      sinon.stub(Employee, 'destroy').resolves(1);

      await employeeController.deleteEmployee(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({
        message: `success to delete employee with id: ${id}`,
        employee,
      })).to.be.true;

      Employee.findByPk.restore();
      Employee.destroy.restore();
    });

    it('should handle case when employee is not found', async () => {
      const id = 1;
      const req = {
        params: { id },
      };
      const res = {};
      const next = sinon.spy();

      sinon.stub(Employee, 'findByPk').resolves(null);

      await employeeController.deleteEmployee(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0]).to.be.an.instanceOf(AppError);
      expect(next.args[0][0].message).to.equal(`Cannot find employee with id: ${id}`);
      expect(next.args[0][0].statusCode).to.equal(403);

      Employee.findByPk.restore();
    });

    it('should handle case when failed to delete the employee', async () => {
      const id = 1;
      const req = {
        params: { id },
      };
      const res = {};
      const next = sinon.spy();

      const employee = { id, name: 'John' };
      sinon.stub(Employee, 'findByPk').resolves(employee);
      sinon.stub(Employee, 'destroy').resolves(0);

      await employeeController.deleteEmployee(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0]).to.be.an.instanceOf(AppError);
      expect(next.args[0][0].message).to.equal('Cannot delete employee');
      expect(next.args[0][0].statusCode).to.equal(403);

      Employee.findByPk.restore();
      Employee.destroy.restore();
    });

    it('should handle errors', async () => {
      const id = 1;
      const req = {
        params: { id },
      };
      const res = {};
      const error = new Error('Database error');
      const next = sinon.spy();

      const employee = { id, name: 'John' };
      sinon.stub(Employee, 'findByPk').resolves(employee);
      sinon.stub(Employee, 'destroy').rejects(error);

      await employeeController.deleteEmployee(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0]).to.equal(error);

      Employee.findByPk.restore();
      Employee.destroy.restore();
    });
  });

});
