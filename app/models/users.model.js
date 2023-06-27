const sequelize = require('../services/connectDatabase');
const { DataTypes } = require('sequelize');

const User = sequelize.define(
    'users',
    {
      userName: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      employeeNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
    },
    {
      timestamps: false,
      tableName: 'users',
    },
);

module.exports = User;
