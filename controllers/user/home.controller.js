const slugify = require('slugify');
const removeAccents = require('remove-accents');

const Category = require('../../models/category.model');
const Book = require('../../models/book.model');

class HomeController {

    async renderHomePage(req, res) {
        try {
            // Lấy tất cả category đang active
            const categories = await Category.find({ isPublic: true }).lean();

            // Lấy sách ngẫu nhiên cho từng category
            const categoriesWithBooks = await Promise.all(
                categories.map(async (category) => {
                    const books = await Book.aggregate([
                        { $match: { categoryId: category._id, isPublic: true } },
                        { $sample: { size: 10 } } // Lấy ngẫu nhiên 10 sách
                    ]);

                    if (books.length === 0) return null;

                    return {
                        ...category,
                        books
                    };
                })
            );

            // Loại bỏ category null (không có sách)
            const filteredCategories = categoriesWithBooks.filter(c => c !== null);

            res.render('pages/user/home.page.hbs', {
                title: 'Sino Innovation Library',
                categories: filteredCategories
            });
        } catch (err) {
            console.error('Lỗi hiển thị trang thể loại:', err);
            return res.status(500).json({
                status: 500,
                code: 'SERVER_ERROR',
                message: 'Lỗi máy chủ',
                data: err.message
            });
        }
    }
}

module.exports = new HomeController();