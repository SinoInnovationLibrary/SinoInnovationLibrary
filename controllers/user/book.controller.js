const slugify = require('slugify');
const removeAccents = require('remove-accents');

const Category = require('../../models/category.model');
const Book = require('../../models/book.model');

class BookController {

    async renderBookDetail(req, res) {
        try {
            const { slug } = req.params;

            const book = await Book.findOne({ slug, isPublic: true })
                .populate('categoryId')
                .lean();

            if (!book) {
                return res.status(404).render('pages/404.hbs', {
                    title: 'Không tìm thấy sách'
                });
            }

            const relatedBooks = await Book.aggregate([
                {
                    $match: {
                        categoryId: book.categoryId._id,
                        isPublic: true,
                        _id: { $ne: book._id }
                    }
                },
                { $sample: { size: 6 } }
            ]);
            res.render('pages/user/book-detail.page.hbs', {
                title: "Sino Innovation Library - " + book.title,
                book,
                relatedBooks
            });
        } catch (err) {
            console.error('Lỗi hiển thị chi tiết sách:', err);
            return res.status(500).json({
                status: 500,
                code: 'SERVER_ERROR',
                message: 'Lỗi máy chủ',
                data: err.message
            });
        }
    }

    async searchBooks(req, res) {
        try {
            let query = req.query.query || "";
            query = query.trim();

            if (!query) {
                return res.json({ books: [] });
            }

            const withoutAccents = removeAccents(query);
            let normalized = slugify(withoutAccents, {
                lower: true,
                strict: true
            });

            if (!normalized) normalized = withoutAccents.toLowerCase();

            const books = await Book.find({
                isPublic: true,
                $or: [
                    { slug: { $regex: normalized, $options: "i" } },
                    { title: { $regex: query, $options: "i" } },
                    { author: { $regex: query, $options: "i" } }
                ]
            })
                .limit(50)
                .lean();

            const testBooks = Array(10).fill(books).flat();

            return res.json({ books: testBooks });
        } catch (err) {
            console.error("Lỗi tìm kiếm:", err);
            return res.status(500).json({
                status: 500,
                code: "SERVER_ERROR",
                message: "Lỗi khi tìm kiếm",
                data: err.message
            });
        }
    }


}

module.exports = new BookController();