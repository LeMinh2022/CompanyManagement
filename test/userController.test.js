const { expect, use } = require('chai');
const sinon = require('sinon');
const { register, login } = require('../app/controllers/user.controller');
const Employee = require('../app/models/employee.model');
const bcrypt = require('bcrypt');
const User = require('../app/models/users.model');
const jwt = require('jsonwebtoken');
const AppError = require('../app/utils/appError');
const logger = require('../app/utils/winstonConfig');

// test register
describe('register', () => {
  let req;
  let res;
  let next;
  let findOneUserStub;
  let findOneEmployeeStub;
  let createStub;
  let genSaltStub;
  let hashStub;
  let signStub;
  let infoStub;
  let statusStub;
  let jsonSpy;

  beforeEach(() => {
    req = {
      body: {
        username: 'testuser',
        password: 'testpassword',
        employeenumber: '123456',
      },
    };

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    next = sinon.spy();

    findOneUserStub = sinon.stub(User, 'findOne');
    findOneEmployeeStub = sinon.stub(Employee, 'findOne');
    createStub = sinon.stub(User, 'create');
    genSaltStub = sinon.stub(bcrypt, 'genSalt');
    hashStub = sinon.stub(bcrypt, 'hash');
    signStub = sinon.stub(jwt, 'sign');
    infoStub = sinon.stub(logger, 'info');

    statusStub = res.status;
    jsonSpy = res.json;
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return error if required data is missing', async () => {
    req.body = {};

    await register(req, res, next);

    expect(next.calledOnce).to.be.true;
    const error = next.args[0][0];
    expect(error).to.be.instanceOf(AppError);
    expect(error.statusCode).to.equal(400);
    expect(error.message).to.equal(
      'Please provide username, password and employee number'
    );
  });

  it('should return error if username is duplicated', async () => {
    findOneUserStub.resolves({});

    await register(req, res, next);

    expect(next.calledOnce).to.be.true;
    const error = next.args[0][0];
    expect(error).to.be.instanceOf(AppError);
    expect(error.statusCode).to.equal(400);
    expect(error.message).to.equal('Your username has been duplicated');
  });

  it('should return error if employeenumber does not exist', async () => {
    findOneEmployeeStub.resolves(null);

    await register(req, res, next);

    expect(next.calledOnce).to.be.true;
    const error = next.args[0][0];
    expect(error).to.be.instanceOf(AppError);
    expect(error.statusCode).to.equal(400);
    expect(error.message).to.equal('Your employee Number does not exist');
  });

  it('should return error if employeenumber is duplicated in user table', async () => {
    findOneEmployeeStub.resolves(true);
    findOneUserStub.onFirstCall().resolves(0);
    findOneUserStub.onSecondCall().resolves(1);
    await register(req, res, next);
    expect(next.calledOnce).to.be.true;
    const error = next.args[0][0];
    expect(error).to.be.instanceOf(AppError);
    expect(error.statusCode).to.equal(400);
    expect(error.message).to.equal('Your employee number has been duplicated');
  });

  it('success to register', async () => {
    findOneEmployeeStub.resolves(true);
    findOneUserStub.onFirstCall().resolves(0);
    findOneUserStub.onSecondCall().resolves(null);

    const salt = 'mockSalt';
    const hashedPassword = 'mockHashedPassword';
    const newUser = {
      userName: 'testuser',
      password: hashedPassword,
      employeeNumber: '123456',
    };
    const token = 'mockToken';
    genSaltStub.resolves(salt);
    hashStub.resolves(hashedPassword);
    createStub.resolves(newUser);
    signStub.returns(token);

    await register(req, res, next);
    expect(res.status.calledWith(201)).to.be.true;

    expect(createStub.calledOnce).to.be.true;
    expect(createStub.args[0][0]).to.deep.equal(newUser);

    expect(signStub.calledOnce).to.be.true;
    expect(signStub.args[0][0]).to.deep.equal({ username: newUser.userName });

    expect(infoStub.calledOnce).to.be.true;
    expect(infoStub.args[0][0]).to.deep.equal({
      message: 'registered successfully',
      userName: newUser.userName,
    });

    expect(statusStub.calledOnce).to.be.true;
    expect(statusStub.args[0][0]).to.equal(201);

    expect(jsonSpy.calledOnce).to.be.true;
    expect(jsonSpy.args[0][0]).to.deep.equal({
      message: 'User registered successfully',
      user: {
        username: newUser.userName,
        employeenumber: newUser.employeeNumber,
      },
      token,
    });
  });

  it('should return error if user creation fails', async () => {
    findOneEmployeeStub.resolves(true);
    findOneUserStub.onFirstCall().resolves(0);
    findOneUserStub.onSecondCall().resolves(null);

    const salt = 'mockSalt';
    const hashedPassword = 'mockHashedPassword';
    const newUser = {
      userName: 'testuser',
      password: hashedPassword,
      employeeNumber: '123456',
    };
    const token = 'mockToken';
    genSaltStub.resolves(salt);
    hashStub.resolves(hashedPassword);
    createStub.resolves(null);

    await register(req, res, next);

    expect(next.calledOnce).to.be.true;
    const error = next.args[0][0];
    expect(error).to.be.instanceOf(AppError);
    expect(error.statusCode).to.equal(400);
    expect(error.message).to.equal('User not created');
  });
  it('should catch error', async () => {
    const error = new Error('Something went wrong');
    findOneUserStub.rejects(error);

    await register(req, res, next);

    expect(next.calledOnce).to.be.true;
  });
});

describe('login', () => {
  let req;
  let res;
  let next;
  let findOneStub;
  let compareStub;
  let signStub;
  let infoStub;
  let statusStub;
  let jsonSpy;

  beforeEach(() => {
    req = {
      body: {
        userName: 'testuser',
        password: 'testpassword',
      },
    };

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    next = sinon.spy();

    findOneStub = sinon.stub(User, 'findOne');
    compareStub = sinon.stub(bcrypt, 'compare');
    signStub = sinon.stub(jwt, 'sign');
    infoStub = sinon.stub(logger, 'info');

    statusStub = res.status;
    jsonSpy = res.json;
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return error if username or password is missing', async () => {
    req.body.userName = null;
    req.body.password = null;

    await login(req, res, next);

    expect(next.calledOnce).to.be.true;
    const error = next.args[0][0];
    expect(error).to.be.instanceOf(AppError);
    expect(error.statusCode).to.equal(400);
    expect(error.message).to.equal('Please provide username, password.');
  });

  it('should return error if user not found', async () => {
    findOneStub.resolves(null);

    await login(req, res, next);

    expect(next.calledOnce).to.be.true;
    const error = next.args[0][0];
    expect(error).to.be.instanceOf(AppError);
    expect(error.statusCode).to.equal(400);
    expect(error.message).to.equal('User not found');
  });

  it('should return error if password is invalid', async () => {
    const user = { userName: 'testuser', password: 'hashedpassword' };
    findOneStub.resolves(user);
    compareStub.resolves(false);

    await login(req, res, next);

    expect(next.calledOnce).to.be.true;
    const error = next.args[0][0];
    expect(error).to.be.instanceOf(AppError);
    expect(error.statusCode).to.equal(422);
    expect(error.message).to.equal('Invalid password');
  });

  it('should create JWT token and return success response', async () => {
    const user = {
      userName: 'testuser',
      password: 'hashedpassword',
      employeeNumber: '123456',
    };
    const token = 'mockToken';

    findOneStub.resolves(user);
    compareStub.resolves(true);
    signStub.returns(token);

    await login(req, res, next);

    expect(signStub.calledOnce).to.be.true;
    expect(signStub.args[0][0]).to.deep.equal({ userName: user.userName });

    expect(infoStub.calledOnce).to.be.true;
    expect(infoStub.args[0][0]).to.deep.equal({
      message: 'login successfully',
      userName: user.userName,
    });

    expect(statusStub.calledOnce).to.be.true;
    expect(statusStub.args[0][0]).to.equal(200);

    expect(jsonSpy.calledOnce).to.be.true;
    expect(jsonSpy.args[0][0]).to.deep.equal({
      message: 'User logged in successfully',
      user: {
        userName: user.userName,
        employeeNumber: user.employeeNumber,
      },
      token,
    });
  });

  it('should catch error', async () => {
    const error = new Error('Something went wrong');
    findOneStub.rejects(error);

    await login(req, res, next);

    expect(next.calledOnce).to.be.true;
  });
});
