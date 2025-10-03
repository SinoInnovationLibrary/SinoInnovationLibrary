const streamifier = require('streamifier');
const slugify = require('slugify');
const removeAccents = require('remove-accents');

const Category = require('../../models/category.model');
const Book = require('../../models/book.model');

const cloudinary = require('../../config/cloudinary');
const { extractPublicId } = require('../../utils/utils')

class BookController {
    async renderBookPage(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const sortField = req.query.sortField || 'name';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

        try {
            const [books, totalCount, categories] = await Promise.all([
                Book.find()
                    .populate({ path: 'categoryId', select: 'name' })
                    .sort({ [sortField]: sortOrder })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Book.countDocuments(),
                Category.find().select('_id name').lean()
            ]);

            const startIndex = totalCount === 0 ? 0 : skip + 1;
            const endIndex = Math.min(skip + books.length, totalCount);
            const totalPages = Math.ceil(totalCount / limit);

            res.render('pages/admin/books.page.hbs', {
                title: 'Quản lý sách',
                books,
                categories,
                pagination: {
                    startIndex,
                    endIndex,
                    currentPage: page,
                    totalPages,
                    hasPrevPage: page > 1,
                    hasNextPage: page < totalPages,
                    prevPage: page - 1,
                    nextPage: page + 1
                },
                currentSortField: sortField,
                currentSortOrder: sortOrder === 1 ? 'asc' : 'desc'
            });
        } catch (err) {
            console.error('Lỗi hiển thị trang sách:', err);
            return res.status(500).json({
                status: 500,
                code: 'SERVER_ERROR',
                message: 'Lỗi máy chủ',
                data: err.message
            });
        }
    }


    async getBookById(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    code: 400,
                    message: 'Thiếu ID sách.',
                    data: null
                });
            }

            const book = await Book.findById(id)
                .populate({
                    path: 'categoryId',
                    select: '_id name'
                })
                .lean();

            if (!book) {
                return res.status(404).json({
                    code: 404,
                    message: 'Không tìm thấy sách.',
                    data: null
                });
            }
            return res.status(200).json({
                code: 200,
                message: 'Lấy sách thành công.',
                data: book
            });

        } catch (err) {
            console.error('Error getting book by ID:', err);
            return res.status(500).json({
                code: 500,
                message: 'Lỗi khi lấy sách.',
                data: null
            });
        }
    }

    async addBook(req, res) {
        try {
            const {
                name,
                author,
                publishedYear,
                categoryId,
                description,
                review } = req.body;
            const file = req.file;

            if (!name || !name.trim()) {
                return res.status(400).json({
                    code: 400,
                    message: 'Tên sách không được để trống.',
                    data: null
                });
            }

            if (!author || !author.trim()) {
                return res.status(400).json({
                    code: 400,
                    message: 'Tác giả không được để trống.',
                    data: null
                });
            }

            if (!publishedYear) {
                return res.status(400).json({
                    code: 400,
                    message: 'Năm xuất bản không được để trống.',
                    data: null
                });
            }

            if (!categoryId) {
                return res.status(400).json({
                    code: 400,
                    message: 'Vui lòng chọn thể loại sách.',
                    data: null
                });
            }

            if (!file) {
                return res.status(400).json({
                    code: 400,
                    message: 'Ảnh bìa là bắt buộc.',
                    data: null
                });
            }

            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(400).send('Thể loại sách không tồn tại');
            }

            const trimmedTitle = name.trim();
            const noAccentTitle = removeAccents(trimmedTitle);
            const slug = slugify(noAccentTitle, { lower: true, strict: true });

            const existed = await Book.findOne({ slug });
            if (existed) {
                return res.status(409).json({
                    code: 409,
                    message: 'Sách đã tồn tại.',
                    data: null
                });
            }

            let imageUrl = '';

            if (file) {
                const result = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: 'mybookthoughts', resource_type: 'image' },
                        (err, result) => {
                            if (err) return reject(err);
                            resolve(result);
                        }
                    );
                    streamifier.createReadStream(file.buffer).pipe(stream);
                });

                imageUrl = result.secure_url;
            }

            const newBook = new Book({
                title: trimmedTitle,
                author: author.trim(),
                publishedYear: publishedYear,
                categoryId: categoryId,
                description: description?.trim() || null,
                review: review?.trim() || null,
                coverImage: imageUrl,
                isPublic: true,
            });

            await newBook.save();

            return res.status(200).json({
                code: 200,
                message: 'Thêm sách thành công.',
                data: newBook
            });

        } catch (err) {
            console.error('Error adding book:', err);
            return res.status(500).json({
                code: 500,
                message: 'Lỗi khi thêm sách.',
                data: null
            });
        }
    }

    async editBook(req, res) {
        try {
            const { id } = req.params;
            const {
                name,
                author,
                publishedYear,
                categoryId,
                description,
                review
            } = req.body;
            const file = req.file;

            if (!id) {
                return res.status(400).json({
                    code: 400,
                    message: 'Thiếu ID sách.',
                    data: null
                });
            }

            const book = await Book.findById(id);
            if (!book) {
                return res.status(404).json({
                    code: 404,
                    message: 'Không tìm thấy sách.',
                    data: null
                });
            }

            if (!name || !name.trim()) {
                return res.status(400).json({
                    code: 400,
                    message: 'Tên sách không được để trống.',
                    data: null
                });
            }

            if (!author || !author.trim()) {
                return res.status(400).json({
                    code: 400,
                    message: 'Tác giả không được để trống.',
                    data: null
                });
            }

            if (!publishedYear) {
                return res.status(400).json({
                    code: 400,
                    message: 'Năm xuất bản không được để trống.',
                    data: null
                });
            }

            if (!categoryId) {
                return res.status(400).json({
                    code: 400,
                    message: 'Vui lòng chọn thể loại sách.',
                    data: null
                });
            }

            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(400).json({
                    code: 400,
                    message: 'Thể loại sách không tồn tại.',
                    data: null
                });
            }

            const trimmedTitle = name.trim();
            const noAccentTitle = removeAccents(trimmedTitle);
            const slug = slugify(noAccentTitle, { lower: true, strict: true });

            const existed = await Book.findOne({ slug, _id: { $ne: id } });
            if (existed) {
                return res.status(409).json({
                    code: 409,
                    message: 'Tên sách đã tồn tại.',
                    data: null
                });
            }

            let imageUrl = book.coverImage;

            if (file) {
                if (book.coverImage) {
                    const publicId = extractPublicId(book.coverImage);
                    await cloudinary.uploader.destroy(publicId);
                }

                const result = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: 'mybookthoughts', resource_type: 'image' },
                        (err, result) => {
                            if (err) return reject(err);
                            resolve(result);
                        }
                    );
                    streamifier.createReadStream(file.buffer).pipe(stream);
                });

                imageUrl = result.secure_url;
            }

            book.title = trimmedTitle;
            book.author = author.trim();
            book.publishedYear = publishedYear;
            book.categoryId = categoryId;
            book.description = description?.trim() || null;
            book.review = review?.trim() || null;
            book.coverImage = imageUrl;
            book.slug = slug;

            await book.save();

            return res.status(200).json({
                code: 200,
                message: 'Cập nhật sách thành công.',
                data: book
            });

        } catch (err) {
            console.error('Error editing book:', err);
            return res.status(500).json({
                code: 500,
                message: 'Lỗi khi cập nhật sách.',
                data: null
            });
        }
    }

    async deleteBook(req, res) {
        try {
            const { id } = req.params;

            const book = await Book.findById(id);
            if (!book) {
                return res.status(404).json({
                    code: 404,
                    message: 'Sách không tồn tại.',
                    data: null
                });
            }

            if (book.coverImage) {
                const publicId = extractPublicId(book.coverImage);
                await cloudinary.uploader.destroy(publicId);
            }
            await Book.findByIdAndDelete(id);

            return res.status(200).json({
                code: 200,
                message: 'Xoá sách thành công.',
                data: null
            });

        } catch (err) {
            console.error('Lỗi khi xoá sách:', err);
            return res.status(500).json({
                code: 500,
                message: 'Lỗi máy chủ khi xoá sách.',
                data: null
            });
        }
    }

    async updatePublicStatus(req, res) {
        try {
            const { id } = req.params;

            const book = await Book.findById(id);
            if (!book) {
                return res.status(404).json({
                    code: 404,
                    message: 'Không tìm thấy thể loại để cập nhật trạng thái.',
                    data: null
                });
            }

            book.isPublic = !book.isPublic;
            await book.save();

            return res.status(200).json({
                code: 200,
                message: `Đã cập nhật trạng thái hiển thị thành ${book.isPublic ? 'công khai' : 'ẩn'}.`,
                data: book
            });
        } catch (err) {
            console.error('Error toggling public status:', err);
            return res.status(500).json({
                code: 500,
                message: 'Lỗi khi cập nhật trạng thái hiển thị.',
                data: null
            });
        }
    }
}

module.exports = new BookController();