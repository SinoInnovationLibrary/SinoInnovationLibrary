const express = require('express');
const router = express.Router();

const BookController = require('../../controllers/user/book.controller')
const CategoryController = require('../../controllers/user/category.controller')

const { setUserLayout } = require('../../middlewares/setLayout');

router.use(setUserLayout);
router.get('/', (req, res) => res.redirect('/home'));
router.use('/home', require('./home'));

router.get('/search', BookController.searchBooks);

router.get('/category/:slug', CategoryController.renderCategoryPage);
router.get('/sach/:slug', BookController.renderBookDetail);


module.exports = router;
