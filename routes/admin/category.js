var express = require('express');
var router = express.Router();

const { asyncHandler } = require('../../middlewares/checkAuth');

const CategoryController = require('../../controllers/admin/category.controller.js');

router.get('/', asyncHandler(CategoryController.renderCategoryPage));
router.post('/add', asyncHandler(CategoryController.addCategory));
router.put('/edit/:id', asyncHandler(CategoryController.editCategory));
router.delete('/delete/:id', asyncHandler(CategoryController.deleteCategory));
router.patch('/update-status/:id', asyncHandler(CategoryController.updatePublicStatus));

module.exports = router;