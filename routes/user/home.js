var express = require('express');
var router = express.Router();

const { asyncHandler } = require('../../middlewares/checkAuth.js');

const HomeController = require('../../controllers/user/home.controller.js');

router.get('/', asyncHandler(HomeController.renderHomePage));
module.exports = router;