const sequelize = require('../services/connectDatabase');
const { DataTypes } = require('sequelize');
const Customer = require('./customer.model');
const User = require('./users.model');

const Employee = sequelize.define(
    'employee',
    {
      employeeNumber: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      extension: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      officeCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      reportsTo: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      jobTitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    },
    {
      tableName: 'employees',
    },
);
// Setup references
Employee.hasOne(Employee, { foreignKey: 'reportsTo' });

// relationship between two tables employees and customers
Employee.hasMany(Customer, { foreignKey: 'saleRapEmployeeNumber' });
Customer.belongsTo(Employee, {
  foreignKey: 'saleRapEmployeeNumber',
  references: {
    model: 'Employee',
    key: 'employeeNumber',
  },
});

// relationship between two tables employees and users
Employee.hasMany(User, { foreignKey: 'employeeNumber' });
User.belongsTo(Employee, {
  foreignKey: 'employeeNumber',
  references: {
    model: 'Employee',
    key: 'employeeNumber',
  },
});

module.exports = Employee;
