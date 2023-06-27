const Joi = require('joi');

// rule to validate employee
const employeeSchema = Joi.object().keys({
  employeeNumber: Joi.number().positive(),
  lastName: Joi.string().min(3).max(50).required(),
  firstName: Joi.string().min(3).max(50).required(),
  extension: Joi.string().max(50).required(),
  email: Joi.string().email().min(10).max(100).required(),
  officeCode: Joi.string().max(10).required(),
  reportsTo: Joi.number().positive().allow(null),
  jobTitle: Joi.string().valid('president', 'manager', 'leader').required(),
});

// rule to validate customer
const customerSchema = Joi.object().keys({
  customerNumber: Joi.number().positive(),
  customerName: Joi.string().min(5).max(50).required(),
  contactLastName: Joi.string().min(3).max(50).required(),
  contactFirstName: Joi.string().min(3).max(50).required(),
  phone: Joi.string().min(8).max(20).required(),
  addressLine1: Joi.string().min(10).max(50).required(),
  addressLine2: Joi.string().min(10).max(50).allow(null),
  city: Joi.string().min(2).max(50).required(),
  state: Joi.string().min(2).max(50).allow(null),
  postalCode: Joi.string().min(5).max(15).allow(null),
  country: Joi.string().min(2).max(50).required(),
  salesRepEmployeeNumber: Joi.number().positive().allow(null),
  creditLimit: Joi.number().precision(2).allow(null),
});

// rule to validate user register
const userRegisterSchema = Joi.object().keys({
  userName: Joi.string().min(3).max(20).required(),
  password: Joi.string()
      .min(6)
      .max(100)
      .regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/)
      .required(),
  employeeNumber: Joi.number().positive().required(),
});

module.exports = {
  employeeSchema,
  customerSchema,
  userRegisterSchema,
};
