const { expect } = require('chai');
const sinon = require('sinon');
const AppError = require('../app/utils/appError');
const customerController = require('../app/controllers/customer.controller');
const Customer = require('../app/models/customer.model');
const Employee = require('../app/models/employee.model');
const error = require('mongoose/lib/error');

describe('customerController', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('checkID', () => {
    it('should call next if the ID is valid', () => {
      const id = 1;
      const req = {
        params: { id },
      };
      const next = sinon.spy();

      customerController.checkID(req, {}, next);

      expect(next.calledOnce).to.be.true;
      expect(next.args[0]).to.be.empty;
    });

    it('should throw an error if the ID is invalid', () => {
      const id = -1;
      const req = {
        params: { id },
      };
      const next = sinon.spy();

      customerController.checkID(req, {}, next);

      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0]).to.be.an.instanceOf(AppError);
      expect(next.args[0][0].message).to.equal('This ID is invalid');
      expect(next.args[0][0].statusCode).to.equal(403);
    });
  });

  describe('getAllCustomers', () => {
    it('should return all customers for staff', async () => {
      const jobTitle = 'staff';
      const employeeNumber = 123;
      const req = {
        userData: { jobTitle, employeeNumber },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      const listCustomers = [{ id: 1, name: 'John' }];
      sinon.stub(Customer, 'findAll').resolves(listCustomers);

      await customerController.getAllCustomers(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith({
          message: 'succeed in get all customer infor',
          listCustomers,
        })
      ).to.be.true;

      Customer.findAll.restore();
    });

    it('should return customers for leader', async () => {
      const jobTitle = 'leader';
      const officeCode = '123';
      const req = {
        userData: { jobTitle, officeCode },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      const listEmployee = [{ employeeNumber: 1 }, { employeeNumber: 2 }];
      const findAllCustomerStub = sinon.stub(Customer, 'findAll');
      sinon.stub(Employee, 'findAll').resolves(listEmployee);
      const listCustomer = [{ id: 1, name: 'John' }];
      findAllCustomerStub.resolves(listCustomer);
      await customerController.getAllCustomers(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith({
          message: 'succeed in get all customer infor',
          listCustomer,
        })
      ).to.be.true;

      Customer.findAll.restore();
      Employee.findAll.restore();
    });

    it('should return all customers for other roles', async () => {
      const jobTitle = 'other';
      const req = {
        userData: { jobTitle },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      const allCustomer = [{ id: 1, name: 'John' }];
      sinon.stub(Customer, 'findAll').resolves(allCustomer);

      await customerController.getAllCustomers(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith({
          message: 'succeed in get all customer infor',
          allCustomer,
        })
      ).to.be.true;

      Customer.findAll.restore();
    });

    it('should handle error when retrieving customers', async () => {
      const jobTitle = 'staff';
      const employeeNumber = 123;
      const req = {
        userData: { jobTitle, employeeNumber },
      };
      const res = {};
      const error = new Error('Database error');
      const next = sinon.spy();

      sinon.stub(Customer, 'findAll').rejects(error);

      await customerController.getAllCustomers(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0]).to.equal(error);

      Customer.findAll.restore();
    });
  });

  describe('createCustomer', () => {
    // it('should create a new customer for staff with correct permissions', async () => {
    //   const jobTitle = 'staff';
    //   const employeeNumber = 123;
    //   const newCustomer = {
    //     name: 'John',
    //     saleRapEmployeeNumber: employeeNumber,
    //   };
    //   const req = {
    //     body: newCustomer,
    //     userData: { jobTitle, employeeNumber },
    //   };
    //   const res = {
    //     status: sinon.stub().returnsThis(),
    //     json: sinon.spy(),
    //   };

    //   sinon.stub(Customer, 'create').resolves(newCustomer);

    //   await customerController.createCustomer(req, res);

    //   expect(res.status.calledWith(200)).to.be.true;
    //   expect(
    //     res.json.calledWith({
    //       message: 'Succeed in creating new customers',
    //       newCustomer,
    //     })
    //   ).to.be.true;

    //   Customer.create.restore();
    // });

    // it('should not create a new customer for staff with incorrect permissions', async () => {
    //   const jobTitle = 'staff';
    //   const employeeNumber = 123;
    //   const newCustomer = { name: 'John', saleRapEmployeeNumber: 456 };
    //   const req = {
    //     body: newCustomer,
    //     userData: { jobTitle, employeeNumber },
    //   };
    //   const res = {};
    //   const next = sinon.spy();

    //   await customerController.createCustomer(req, res, next);

    //   expect(next.calledOnce).to.be.true;
    //   expect(next.args[0][0]).to.be.instanceOf(AppError);
    //   expect(next.args[0][0].message).to.equal(
    //     'You do not have permission to create new customer whom you do not manage'
    //   );
    //   expect(next.args[0][0].statusCode).to.equal(403);
    // });

    it('should create a new customer for leader with correct permissions', async () => {
      const jobTitle = 'leader';
      const officeCode = '123';
      const newCustomer = { name: 'John', saleRapEmployeeNumber: 456 };
      const req = {
        body: newCustomer,
        userData: { jobTitle, officeCode },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      const employee = { employeeNumber: 456, dataValues:{officeCode} };
      sinon.stub(Employee, 'findOne').resolves(employee);
      sinon.stub(Customer, 'create').resolves(newCustomer);

      await customerController.createCustomer(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith({
          message: 'Succeed in creating new customers',
          newCustomer,
        })
      ).to.be.true;

      Employee.findOne.restore();
      Customer.create.restore();
    });

    // it('should not create a new customer for leader with incorrect permissions', async () => {
    //   const jobTitle = 'leader';
    //   const officeCode = '123';
    //   const newCustomer = { name: 'John', saleRapEmployeeNumber: 789 };
    //   const req = {
    //     body: newCustomer,
    //     userData: { jobTitle, officeCode },
    //   };
    //   const res = {};
    //   const next = sinon.spy();

    //   sinon.stub(Employee, 'findOne').resolves(null);

    //   await customerController.createCustomer(req, res, next);

    //   expect(next.calledOnce).to.be.true;
    //   expect(next.args[0][0]).to.be.instanceOf(AppError);
    //   expect(next.args[0][0].message).to.equal(
    //     'Sorry, but the employee does not exist'
    //   );
    //   expect(next.args[0][0].statusCode).to.equal(403);

    //   Employee.findOne.restore();
    // });

    it('should create a new customer for other roles', async () => {
      const jobTitle = 'other';
      const newCustomer = { name: 'John' };
      const req = {
        body: newCustomer,
        userData: { jobTitle },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      sinon.stub(Customer, 'create').resolves(newCustomer);

      await customerController.createCustomer(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith({
          message: 'Succeed in creating new customers',
          newCustomer,
        })
      ).to.be.true;

      Customer.create.restore();
    });

    it('should handle errors during customer creation', async () => {
      const jobTitle = 'staff';
      const employeeNumber = 123;
      const newCustomer = {
        name: 'John',
        saleRapEmployeeNumber: employeeNumber,
      };
      const req = {
        body: newCustomer,
        userData: { jobTitle, employeeNumber },
      };
      const res = {};
      const next = sinon.spy();

      sinon.stub(Customer, 'create').throws(new Error('Database error'));

      await customerController.createCustomer(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0]).to.be.instanceOf(error)
      expect(next.args[0][0].message).to.equal('Database error');

      Customer.create.restore();
    });
  });

  describe('getCustomerById', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should get customer information for staff with correct permissions', async () => {
      // Arrange
      const jobTitle = 'staff';
      const employeeNumber = 123;
      const id = 456;
      const customerInfo = { id, name: 'John' };
      const req = {
        params: { id },
        userData: { jobTitle, employeeNumber },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      sinon.stub(Customer, 'findByPk').resolves(customerInfo);

      // Act
      await customerController.getCustomerById(req, res);

      // Assert
      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith({
          message: `succeed in get customer infor with id: ${id}`,
          customerInfor: customerInfo,
        })
      ).to.be.true;
    });

    it('should return 400 error when id is not provided', async () => {
      // Arrange
      const req = {
        params: {},
        userData: { jobTitle: 'staff' },
      };
      const next = sinon.spy();

      // Act
      await customerController.getCustomerById(req, {}, next);

      // Assert
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0]).to.be.instanceOf(AppError);
      expect(next.args[0][0].message).to.equal('Please provide id');
      expect(next.args[0][0].statusCode).to.equal(400);
    });

    it('should return 400 error for staff with incorrect permissions', async () => {
      // Arrange
      const jobTitle = 'staff';
      const employeeNumber = 123;
      const id = 456;
      const req = {
        params: { id },
        userData: { jobTitle, employeeNumber },
      };
      const next = sinon.spy();

      // Act
      await customerController.getCustomerById(req, {}, next);

      // Assert
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0]).to.be.instanceOf(AppError);
      expect(next.args[0][0].message).to.equal(
        'You do not have permission to get this customer information'
      );
      expect(next.args[0][0].statusCode).to.equal(400);
    });

    it('should get customer information for leader with correct permissions', async () => {
      // Arrange
      const jobTitle = 'leader';
      const officeCode = '123';
      const id = 456;
      const customerInfo = { id, name: 'John' };
      const req = {
        params: { id },
        userData: { jobTitle, officeCode },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      sinon
        .stub(Employee, 'findOne')
        .resolves({ employeeNumber: id, officeCode });
      sinon.stub(Customer, 'findByPk').resolves(customerInfo);

      // Act
      await customerController.getCustomerById(req, res, () => {});

      // Assert
      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith({
          message: `succeed in get customer infor with id: ${id}`,
          customerInfor: customerInfo,
        })
      ).to.be.true;
    });

    it('should return 403 error when employee is not found for leader', async () => {
      // Arrange
      const jobTitle = 'leader';
      const officeCode = '123';
      const id = 456;
      const req = {
        params: { id },
        userData: { jobTitle, officeCode },
      };
      const next = sinon.spy();

      sinon.stub(Employee, 'findOne').resolves(null);

      // Act
      await customerController.getCustomerById(req, {}, next);

      // Assert
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0]).to.be.instanceOf(AppError);
      expect(next.args[0][0].message).to.equal(
        'Employee not found, so you cant continue'
      );
      expect(next.args[0][0].statusCode).to.equal(403);
    });

    it('should return 403 error for leader with incorrect permissions', async () => {
      // Arrange
      const jobTitle = 'leader';
      const officeCode = '123';
      const id = 456;
      const req = {
        params: { id },
        userData: { jobTitle, officeCode },
      };
      const next = sinon.spy();

      sinon
        .stub(Employee, 'findOne')
        .resolves({ employeeNumber: id, officeCode: '456' });

      // Act
      await customerController.getCustomerById(req, {}, next);

      // Assert
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0]).to.be.instanceOf(AppError);
      expect(next.args[0][0].message).to.equal(
        'You do not have permission to get this customer information'
      );
      expect(next.args[0][0].statusCode).to.equal(403);
    });

    it('should return customer information for other roles', async () => {
      // Arrange
      const jobTitle = 'other';
      const id = 123;
      const customerInfo = { id, name: 'John' };
      const req = {
        params: { id },
        userData: { jobTitle },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      sinon.stub(Customer, 'findByPk').resolves(customerInfo);

      // Act
      await customerController.getCustomerById(req, res, () => {});

      // Assert
      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith({
          message: `succeed in get customer infor with id: ${id}`,
          customerInfor: customerInfo,
        })
      ).to.be.true;
    });

    it('should return 403 error when customer is not found', async () => {
      // Arrange
      const jobTitle = 'other';
      const id = 123;
      const req = {
        params: { id },
        userData: { jobTitle },
      };
      const next = sinon.spy();

      sinon.stub(Customer, 'findByPk').resolves(null);

      // Act
      await customerController.getCustomerById(req, {}, next);

      // Assert
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0]).to.be.instanceOf(AppError);
      expect(next.args[0][0].message).to.equal(
        `Customer with id: ${id} not found`
      );
      expect(next.args[0][0].statusCode).to.equal(403);
    });

    it('should call next with error if an exception occurs', async () => {
      // Arrange
      const error = new Error('Internal server error');
      const req = {
        params: { id: 123 },
        userData: { jobTitle: 'staff' },
      };
      const next = sinon.spy();

      sinon.stub(Customer, 'findByPk').rejects(error);

      // Act
      await customerController.getCustomerById(req, {}, next);

      // Assert
      expect(next.calledOnce).to.be.true;
    });
  });

  describe('updateCustomerById', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should update customer information for staff with matching id', async () => {
      // Arrange
      const jobTitle = 'staff';
      const employeeNumber = 123;
      const id = 123;
      const updateCustomerInfo = { name: 'John Doe' };
      const req = {
        params: { id },
        userData: { jobTitle, employeeNumber },
        body: updateCustomerInfo,
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      const customerInfo = { id, name: 'John' };
      const updateCus = sinon.stub().resolves(customerInfo);
      const customerInfor = { update: updateCus };

      sinon.stub(Customer, 'findByPk').resolves(customerInfor);

      // Act
      await customerController.updateCustomerById(req, res, () => {});

      // Assert
      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith({
          message: `succeed in get customer infor with id: ${id}`,
          customerInfor,
        })
      ).to.be.true;
      expect(updateCus.calledWith(updateCustomerInfo)).to.be.true;
    });

    it('should update customer information for leader with matching officeCode and id', async () => {
      // Arrange
      const jobTitle = 'leader';
      const officeCode = 123;
      const id = 123;
      const updateCustomerInfo = { name: 'John Doe' };
      const req = {
        params: { id },
        userData: { jobTitle, officeCode },
        body: updateCustomerInfo,
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      const employee = { officeCode };
      sinon.stub(Employee, 'findOne').resolves(employee);

      const customerInfo = { id, name: 'John' };
      const updateCus = sinon.stub().resolves(customerInfo);
      const customerInfor = { update: updateCus };

      sinon.stub(Customer, 'findByPk').resolves(customerInfor);

      // Act
      await customerController.updateCustomerById(req, res, () => {});

      // Assert
      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith({
          message: `succeed in get all customer infor with id: ${id}`,
          customerInfor,
        })
      ).to.be.true;
      expect(updateCus.calledWith(updateCustomerInfo)).to.be.true;
    });

    it('should update customer information for other roles with matching id', async () => {
      // Arrange
      const jobTitle = 'otherRole';
      const id = 123;
      const updateCustomerInfo = { name: 'John Doe' };
      const req = {
        params: { id },
        userData: { jobTitle },
        body: updateCustomerInfo,
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      const customerInfo = { id, name: 'John' };
      const updateCus = sinon.stub().resolves(customerInfo);
      const customerInfor = { update: updateCus };

      sinon.stub(Customer, 'findByPk').resolves(customerInfor);

      // Act
      await customerController.updateCustomerById(req, res, () => {});

      // Assert
      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith({
          message: `succeed in get all customer infor with id: ${id}`,
          customerInfor,
        })
      ).to.be.true;
      expect(updateCus.calledWith(updateCustomerInfo)).to.be.true;
    });

    it('should return an error if customer information is not provided in the request body', async () => {
      // Arrange
      const jobTitle = 'staff';
      const employeeNumber = 123;
      const id = 123;
      const req = {
        params: { id },
        body: {},
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      const next = sinon.spy();

      // Act
      await customerController.updateCustomerById(req, res, next);

      // Assert
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0]).to.be.an.instanceOf(AppError);
      expect(next.args[0][0].message).to.equal(
        'Please enter customer infor to update'
      );
      expect(next.args[0][0].statusCode).to.equal(403);
    });

    it('should return an error if id is not provided in the request parameters', async () => {
      // Arrange
      const jobTitle = 'staff';
      const employeeNumber = 123;
      const req = {
        params: {},
        userData: { jobTitle, employeeNumber },
        body: { name: 'John Doe' },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      const next = sinon.spy();

      // Act
      await customerController.updateCustomerById(req, res, next);

      // Assert
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal('Please provide id');
      expect(next.args[0][0].statusCode).to.equal(403);
    });

    it('should return an error if staff does not have permission to update customer information with different id', async () => {
      // Arrange
      const jobTitle = 'staff';
      const employeeNumber = 123;
      const id = 456;
      const req = {
        params: { id },
        userData: { jobTitle, employeeNumber },
        body: { name: 'John Doe' },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      const next = sinon.spy();

      // Act
      await customerController.updateCustomerById(req, res, next);

      // Assert
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal(
        'You do not have permission to get this customer information'
      );
      expect(next.args[0][0].statusCode).to.equal(403);
    });

    it('should return an error if customer with specified id is not found', async () => {
      // Arrange
      const jobTitle = 'staff';
      const employeeNumber = 123;
      const id = 123;
      const updateCustomerInfo = { name: 'John Doe' };
      const req = {
        params: { id },
        userData: { jobTitle, employeeNumber },
        body: updateCustomerInfo,
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      const customerInfor = null;
      sinon.stub(Customer, 'findByPk').resolves(customerInfor);

      const next = sinon.spy();

      // Act
      await customerController.updateCustomerById(req, res, next);

      // Assert
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal(
        `Customer with id: ${id} not found`
      );
      expect(next.args[0][0].statusCode).to.equal(403);
    });

    it('should return an error if update customer information fails', async () => {
      // Arrange
      const jobTitle = 'staff';
      const employeeNumber = 123;
      const id = 123;
      const updateCustomerInfo = { name: 'John Doe' };
      const req = {
        params: { id },
        userData: { jobTitle, employeeNumber },
        body: updateCustomerInfo,
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      const customerInfo = { id, name: 'John' };
      const updateCus = sinon.stub().returns(null);
      const customerInfor = { update: updateCus };

      sinon.stub(Customer, 'findByPk').resolves(customerInfor);

      const next = sinon.spy();

      // Act
      await customerController.updateCustomerById(req, res, next);

      // Assert
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal('can not update customer infor');
      expect(next.args[0][0].statusCode).to.equal(403);
    });

    it('should return an error if employee is not found for leader role', async () => {
      // Arrange
      const jobTitle = 'leader';
      const id = 123;
      const updateCustomerInfo = { name: 'John Doe' };
      const req = {
        params: { id },
        userData: { jobTitle },
        body: updateCustomerInfo,
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      sinon.stub(Employee, 'findOne').resolves(null);

      const next = sinon.spy();

      // Act
      await customerController.updateCustomerById(req, res, next);

      // Assert
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal(
        'Employee not found, so you cant countinue.'
      );
      expect(next.args[0][0].statusCode).to.equal(403);
    });

    it('should return an error if leader does not have permission to update customer information with different officeCode', async () => {
      // Arrange
      const jobTitle = 'leader';
      const officeCode = 123;
      const id = 456;
      const req = {
        params: { id },
        userData: { jobTitle, officeCode },
        body: { name: 'John Doe' },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      const employee = { officeCode: 789 };
      sinon.stub(Employee, 'findOne').resolves(employee);

      const next = sinon.spy();

      // Act
      await customerController.updateCustomerById(req, res, next);

      // Assert
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal(
        'You do not have permission to get this customer information'
      );
      expect(next.args[0][0].statusCode).to.equal(403);
    });
  });

  describe('deleteCustomer', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should delete a customer for staff with matching id', async () => {
      // Arrange
      const jobTitle = 'staff';
      const employeeNumber = 123;
      const id = 123;
      const req = {
        params: { id },
        userData: { jobTitle, employeeNumber },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      const customerInfor = { destroy: sinon.stub() };
      sinon.stub(Customer, 'findByPk').resolves(customerInfor);

      const next = sinon.spy();

      // Act
      await customerController.deleteCustomer(req, res, next);

      // Assert
      expect(customerInfor.destroy.calledOnce).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith({
          message: `succeed delete customer infor with id: ${id}`,
          customerInfor,
        })
      ).to.be.true;
    });

    it('should return an error if id is not provided in the request parameters', async () => {
      // Arrange
      const jobTitle = 'staff';
      const employeeNumber = 123;
      const req = {
        params: {},
        userData: { jobTitle, employeeNumber },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      const next = sinon.spy();

      // Act
      await customerController.deleteCustomer(req, res, next);

      // Assert
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal('Please provide id');
      expect(next.args[0][0].statusCode).to.equal(403);
    });

    it('should return an error if staff does not have permission to delete customer with different id', async () => {
      // Arrange
      const jobTitle = 'staff';
      const employeeNumber = 123;
      const id = 456;
      const req = {
        params: { id },
        userData: { jobTitle, employeeNumber },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      const next = sinon.spy();

      // Act
      await customerController.deleteCustomer(req, res, next);

      // Assert
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal(
        'You do not have permission to get this customer information'
      );
      expect(next.args[0][0].statusCode).to.equal(403);
    });

    it('should return an error if customer with specified id is not found', async () => {
      // Arrange
      const jobTitle = 'staff';
      const employeeNumber = 123;
      const id = 123;
      const req = {
        params: { id },
        userData: { jobTitle, employeeNumber },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      const customerInfor = null;
      sinon.stub(Customer, 'findByPk').resolves(customerInfor);

      const next = sinon.spy();

      // Act
      await customerController.deleteCustomer(req, res, next);

      // Assert
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal(
        `Customer with id: ${id} not found`
      );
      expect(next.args[0][0].statusCode).to.equal(403);
    });

    it('should return an error if delete customer fails', async () => {
      // Arrange
      const jobTitle = 'staff';
      const employeeNumber = 123;
      const id = 123;
      const req = {
        params: { id },
        userData: { jobTitle, employeeNumber },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      const customerInfor = { destroy: sinon.stub().returns(null) };
      sinon.stub(Customer, 'findByPk').resolves(customerInfor);

      const next = sinon.spy();

      // Act
      await customerController.deleteCustomer(req, res, next);

      // Assert
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal('can not delete customer');
      expect(next.args[0][0].statusCode).to.equal(403);
    });
//f
    it('should delete a customer for leader with matching id and officeCode', async () => {
      // Arrange
      const jobTitle = 'leader';
      const officeCode = 123;
      const id = 123;
      const req = {
        params: { id },
        userData: { jobTitle, officeCode },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      const employee = { officeCode };
      const customerInfor = { destroy: sinon.stub() };

      sinon.stub(Employee, 'findOne').resolves(employee);
      sinon.stub(Customer, 'findByPk').resolves(customerInfor);

      const next = sinon.spy();

      // Act
      await customerController.deleteCustomer(req, res, next);

      // Assert
      expect(customerInfor.destroy.calledOnce).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith({
          message: `succeed in delete customer infor with id: ${id}`,
          customerInfor,
        })
      ).to.be.true;
    });

    it('should return an error if employee is not found for leader role', async () => {
      // Arrange
      const jobTitle = 'leader';
      const id = 123;
      const req = {
        params: { id },
        userData: { jobTitle },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      sinon.stub(Employee, 'findOne').resolves(null);

      const next = sinon.spy();

      // Act
      await customerController.deleteCustomer(req, res, next);

      // Assert
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal(
        'Employee not found, so you cant countinue.'
      );
      expect(next.args[0][0].statusCode).to.equal(403);
    });

    it('should return an error if leader does not have permission to delete customer with different officeCode', async () => {
      // Arrange
      const jobTitle = 'leader';
      const officeCode = 123;
      const id = 456;
      const req = {
        params: { id },
        userData: { jobTitle, officeCode },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      const employee = { officeCode: 789 };

      sinon.stub(Employee, 'findOne').resolves(employee);

      const next = sinon.spy();

      // Act
      await customerController.deleteCustomer(req, res, next);

      // Assert
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal(
        'You do not have permission to get this customer information'
      );
      expect(next.args[0][0].statusCode).to.equal(403);
    });

    it('should return an error if delete customer fails for leader', async () => {
      // Arrange
      const jobTitle = 'leader';
      const officeCode = 123;
      const id = 123;
      const req = {
        params: { id },
        userData: { jobTitle, officeCode },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      const employee = { officeCode };
      const customerInfor = { destroy: sinon.stub().returns(null) };

      sinon.stub(Employee, 'findOne').resolves(employee);
      sinon.stub(Customer, 'findByPk').resolves(customerInfor);

      const next = sinon.spy();

      // Act
      await customerController.deleteCustomer(req, res, next);

      // Assert
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal('can not delete customer');
      expect(next.args[0][0].statusCode).to.equal(403);
    });
  });
});
