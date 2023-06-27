const { Sequelize } = require('sequelize');
require('dotenv').config();
const mysql2 = require('mysql2');
const sequelize = new Sequelize({
  logging: false,
  dialect: 'mysql',
  dialectModule: mysql2,
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

sequelize
    .sync()
    .then(() => {
      console.log('Database synchronized');
    })
    .catch((error) => {
      console.error('Error synchronizing database:', error);
    });

module.exports = sequelize;
