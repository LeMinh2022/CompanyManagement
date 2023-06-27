const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const checkToken = require('../middleware/auth.token');
const checkAuthorize = require('../middleware/athorize');
const validate = require('../middleware/validation');
const { employeeSchema } = require('../validation/validationRule');


/* GET users listing. */
router
    .route('/')
    .get(
        checkToken,
        checkAuthorize('employee', 'read'),
        employeeController.getAllEmployees,
    )
    .post(
        checkToken,
        validate(employeeSchema),
        checkAuthorize('employee', 'create'),
        employeeController.createEmployee,
    );
router
    .route('/:id')
    .get(
        checkToken,
        checkAuthorize('employee', 'read'),
        employeeController.checkID,
        employeeController.getEmployeeById,
    )
    .patch(
        checkToken,
        validate(employeeSchema),
        checkAuthorize('employee', 'update'),
        employeeController.checkID,
        employeeController.updateEmployeeById,
    )
    .delete(
        checkToken,
        checkAuthorize('employee', 'delete'),
        employeeController.checkID,
        employeeController.deleteEmployee,
    );

module.exports = router;
