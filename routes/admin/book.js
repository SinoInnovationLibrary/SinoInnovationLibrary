var express = require('express');
var router = express.Router();
const upload = require('../../config/common/upload');

const { asyncHandler } = require('../../middlewares/checkAuth.js');

const BookController = require('../../controllers/admin/book.controller.js');

router.get('/', asyncHandler(BookController.renderBookPage));
router.post('/add', upload.single('coverImage'), asyncHandler(BookController.addBook));
router.put('/edit/:id', upload.single('coverImage'), asyncHandler(BookController.editBook));
router.delete('/delete/:id', asyncHandler(BookController.deleteBook));
router.patch('/update-status/:id', asyncHandler(BookController.updatePublicStatus));

router.get('/:id', asyncHandler(BookController.getBookById));

module.exports = router;