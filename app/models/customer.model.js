const sequelize = require('../services/connectDatabase');
const { DataTypes } = require('sequelize');

const Customer = sequelize.define(
    'customer',
    {
      customerNumber: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      customerName: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      contactLastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      contactFirstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      addressLine1: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      addressLine2: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      postalCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      saleRapEmployeeNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      creditLimit: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    },
    {
      tableName: 'customers',
    },
);

module.exports = Customer;
