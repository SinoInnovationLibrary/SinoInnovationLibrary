const slugify = require('slugify');
const removeAccents = require('remove-accents');

const Category = require('../../models/category.model');
const Book = require('../../models/book.model');

class CategoryController {

    async renderCategoryPage(req, res) {
        try {
            const { slug } = req.params;

            const category = await Category.findOne({ slug, isPublic: true }).lean();
            if (!category) {
                return res.status(404).render('pages/404.hbs', {
                    title: 'Không tìm thấy thể loại'
                });
            }

            const books = await Book.find({
                categoryId: category._id,
                isPublic: true
            })
                .sort({ createdAt: -1 })
                .lean();

            res.render('pages/user/category.page.hbs', {
                title: "Sino Innovation Library - " + category.name,
                category,
                books
            });
        } catch (err) {
            console.error('Lỗi hiển thị sách theo thể loại:', err);
            return res.status(500).json({
                status: 500,
                code: 'SERVER_ERROR',
                message: 'Lỗi máy chủ',
                data: err.message
            });
        }
    }

}

module.exports = new CategoryController();