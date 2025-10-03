const slugify = require('slugify');
const removeAccents = require('remove-accents');

const Category = require('../../models/category.model');
const Book = require('../../models/book.model');

class HomeController {

    async renderHomePage(req, res) {
        try {
            // Lấy tất cả category đang active
            const categories = await Category.find({ isPublic: true }).lean();

            // Lấy sách cho từng category
            const categoriesWithBooks = await Promise.all(
                categories.map(async (category) => {
                    const books = await Book.find({
                        categoryId: category._id,
                        isPublic: true
                    })
                        .sort({ createdAt: -1 }) // ưu tiên sách mới nhất
                        .limit(10)
                        .lean();

                    // Nếu category không có sách thì return null
                    if (books.length === 0) return null;

                    return {
                        ...category,
                        books
                    };
                })
            );

            // Loại bỏ category null (không có sách)
            const filteredCategories = categoriesWithBooks.filter(c => c !== null);
            const repeatedCategories = Array.from({ length: 10 }, () => filteredCategories).flat();

            res.render('pages/user/home.page.hbs', {
                title: 'Home',
                categories: repeatedCategories
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