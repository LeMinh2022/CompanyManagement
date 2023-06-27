const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const checkToken = require('../middleware/auth.token');
const checkAuthorize = require('../middleware/athorize');
const validate = require('../middleware/validation');
const { customerSchema } = require('../validation/validationRule');

/* GET users listing. */
router
    .route('/')
    .get(
        checkToken,
        checkAuthorize('customer', 'read'),
        customerController.getAllCustomers,
    )
    .post(
        checkToken,
        checkAuthorize('customer', 'create'),
        validate(customerSchema),
        customerController.createCustomer,
    );

// route with ID
router
    .route('/:id')
    .get(
        checkToken,
        checkAuthorize('customer', 'read'),
        customerController.checkID,
        customerController.getCustomerById,
    )
    .patch(
        checkToken,
        validate(customerSchema),
        checkAuthorize('customer', 'update'),
        customerController.checkID,
        customerController.updateCustomerById,
    )
    .delete(
        checkToken,
        checkAuthorize('customer', 'delete'),
        customerController.checkID,
        customerController.deleteCustomer,
    );

module.exports = router;
