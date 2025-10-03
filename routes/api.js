const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middlewares/checkAuth');

const ApiController = require('../controllers/api.controller');

router.get('/image/:id', asyncHandler(ApiController.streamImage));
router.post('/ai/summarize', asyncHandler(ApiController.summarize));

module.exports = router;
