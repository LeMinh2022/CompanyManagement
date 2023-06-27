const yaml = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: `In this assignment, you will develop a set of REST APIs for a small company,
       capable of managing its employees, 
        customers a server and returning information by using a collection of simple HTTP requests,
         as well as manipulating data for admin and manager of the company.`,
    },
    servers: [
      {
        url: 'localhost:3000',
      },
    ],
    apis: ['./app/routes/*.js'],
  },
};
const swaggerSpec = swaggerDocument(options);
const swaggerDocs = yaml.stringify(swaggerSpec, 10);

module.exports = {
  swaggerUi,
  swaggerDocs,
};
