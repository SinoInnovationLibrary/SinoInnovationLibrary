const slugify = require('slugify');
const removeAccents = require('remove-accents');

const Category = require('../../models/category.model');
const Book = require('../../models/book.model');

class CategoryController {

    async renderCategoryPage(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const sortField = req.query.sortField || 'name';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

        try {
            // Lấy dữ liệu phân trang & tổng số lượng
            const [categories, totalCount] = await Promise.all([
                Category.find()
                    .sort({ [sortField]: sortOrder })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Category.countDocuments()
            ]);

            // Kiểm tra mỗi category có đang được sử dụng không
            const categoriesWithStatus = await Promise.all(
                categories.map(async (category) => {
                    const count = await Book.countDocuments({ categoryId: category._id });
                    return {
                        ...category,
                        isDeletable: count === 0
                    };
                })
            );

            // Tính toán phân trang
            const startIndex = totalCount === 0 ? 0 : skip + 1;
            const endIndex = Math.min(skip + categories.length, totalCount);
            const totalPages = Math.ceil(totalCount / limit);

            res.render('pages/admin/categories.page.hbs', {
                title: 'Quản lý thể loại',
                categories: categoriesWithStatus,
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
            console.error('Lỗi hiển thị trang thể loại:', err);
            return res.status(500).json({
                status: 500,
                code: 'SERVER_ERROR',
                message: 'Lỗi máy chủ',
                data: err.message
            });
        }
    }

    async addCategory(req, res) {
        try {
            const { name, description } = req.body;

            if (!name || !name.trim()) {
                return res.status(400).json({
                    code: 400,
                    message: 'Tên thể loại không được để trống.',
                    data: null
                });
            }

            const trimmedName = name.trim();
            const noAccentName = removeAccents(trimmedName);
            const slug = slugify(noAccentName, { lower: true, strict: true });

            const existed = await Category.findOne({ slug });
            if (existed) {
                return res.status(409).json({
                    code: 409,
                    message: 'Thể loại đã tồn tại.',
                    data: null
                });
            }

            const newCategory = new Category({
                name: trimmedName,
                description: description?.trim() || null,
                isPublic: true,
                slug
            });

            await newCategory.save();

            return res.status(200).json({
                code: 200,
                message: 'Thêm thể loại thành công.',
                data: newCategory
            });
        } catch (err) {
            console.error('Error adding category:', err);
            return res.status(500).json({
                code: 500,
                message: 'Lỗi khi thêm thể loại.',
                data: null
            });
        }
    }
    async editCategory(req, res) {
        try {
            const { id } = req.params;
            const { name, description } = req.body;

            if (!name || !name.trim()) {
                return res.status(400).json({
                    code: 400,
                    message: 'Tên thể loại không được để trống.',
                    data: null
                });
            }

            const trimmedName = name.trim();
            const noAccentName = removeAccents(trimmedName);
            const slug = slugify(noAccentName, { lower: true, strict: true });

            const existed = await Category.findOne({ slug, _id: { $ne: id } });
            if (existed) {
                return res.status(409).json({
                    code: 409,
                    message: 'Thể loại đã tồn tại.',
                    data: null
                });
            }

            const updatedCategory = await Category.findByIdAndUpdate(
                id,
                {
                    name: trimmedName,
                    description: description?.trim() || null,
                    slug
                },
                { new: true }
            ).lean();

            if (!updatedCategory) {
                return res.status(404).json({
                    code: 404,
                    message: 'Không tìm thấy thể loại để cập nhật.',
                    data: null
                });
            }

            return res.status(200).json({
                code: 200,
                message: 'Cập nhật thể loại thành công.',
                data: updatedCategory
            });
        } catch (err) {
            console.error('Error editing category:', err);
            return res.status(500).json({
                code: 500,
                message: 'Lỗi khi cập nhật thể loại.',
                data: null
            });
        }
    }

    async deleteCategory(req, res) {
        try {
            const { id } = req.params;

            const bookCount = await Book.countDocuments({ categoryId: id });
            if (bookCount > 0) {
                return res.status(400).json({
                    code: 400,
                    message: 'Không thể xoá thể loại đang được sử dụng trong sách.',
                    data: null
                });
            }

            const deleted = await Category.findByIdAndDelete(id);
            if (!deleted) {
                return res.status(404).json({
                    code: 404,
                    message: 'Không tìm thấy thể loại để xoá.',
                    data: null
                });
            }

            return res.status(200).json({
                code: 200,
                message: 'Xoá thể loại thành công.',
                data: deleted
            });
        } catch (err) {
            console.error('Error deleting category:', err);
            return res.status(500).json({
                code: 500,
                message: 'Lỗi khi xoá thể loại.',
                data: null
            });
        }
    }

    async updatePublicStatus(req, res) {
        try {
            const { id } = req.params;

            const category = await Category.findById(id);
            if (!category) {
                return res.status(404).json({
                    code: 404,
                    message: 'Không tìm thấy thể loại để cập nhật trạng thái.',
                    data: null
                });
            }

            category.isPublic = !category.isPublic;
            await category.save();

            return res.status(200).json({
                code: 200,
                message: `Đã cập nhật trạng thái hiển thị thành ${category.isPublic ? 'công khai' : 'ẩn'}.`,
                data: category
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

module.exports = new CategoryController();