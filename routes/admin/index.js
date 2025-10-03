const express = require('express');
const router = express.Router();
const { setAdminLayout } = require('../../middlewares/setLayout');
const { authAdmin } = require('../../middlewares/checkAuth');

router.use(setAdminLayout);
router.use('/categories' , authAdmin , require('./category'));
router.use('/books', authAdmin, require('./book'));

module.exports = router;
