import {
    addBook,
    editBook,
    deleteBook,
    updateBookStatus,
    getBookById,
} from '../api/books.api.js';

class CategoriesPage {
    constructor() {
        this.booksPage = document.querySelector('.books-page');

        this.addBooksForm = document.getElementById('addBookForm');
        this.editBookForm = document.getElementById('editBookForm');
        this.bindEvents();
    }

    bindEvents() {
        if (this.addBooksForm) {
            this.addBooksForm.addEventListener("submit", (e) => this.handleAddBook(e));
        }

        if (this.editBookForm) {
            this.editBookForm.addEventListener("submit", (e) => this.handleEditBook(e));
        }

        document.addEventListener('click', async (e) => {
            const editBtn = e.target.closest('.edit-btn');
            if (editBtn) {
                const id = editBtn.dataset.id;

                showLoading();
                try {

                    const result = await getBookById(id);
                    const book = result.data;
                    if (book) {
              
                        this.editBookForm.id.value = book._id;
                        this.editBookForm.name.value = book.title;
                        this.editBookForm.author.value = book.author;
                        this.editBookForm.publishedYear.value = book.publishedYear;
                        this.editBookForm.review.value = book.review ? book.review : '';
                        this.editBookForm.categoryId.value = book.categoryId ? book.categoryId._id : '';

                        const editPreview = document.getElementById('editCoverPreview');
                        if (editPreview && book.coverImage) {
                            editPreview.src = book.coverImage;
                            editPreview.style.display = 'block';
                        }

                    }
                } catch (err) {
                    console.error("Lỗi:", err);
                } finally {
                    hideLoading();
                }
            }

            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                const id = deleteBtn.dataset.id;
                this.handleDeleteCategory(id);
            }
        });

        document.addEventListener("click", (e) => {
            if (e.target.classList.contains("delete-btn")) {
                const id = e.target.dataset.id;
                this.handleDeleteBook(id);
            }
        });

        const addBookCoverImage = document.getElementById('addBookCoverImage');
        addBookCoverImage.addEventListener('change', function (e) {
            const file = e.target.files[0];
            const preview = document.getElementById('addCoverPreview');
            if (file) {
                preview.src = URL.createObjectURL(file);
                preview.style.display = 'block';
            }
        });

        const editBookCoverImage = document.getElementById('editBookCoverImage');
        editBookCoverImage.addEventListener('change', function (e) {
            const file = e.target.files[0];
            const preview = document.getElementById('editCoverPreview');
            if (file) {
                preview.src = URL.createObjectURL(file);
                preview.style.display = 'block';
            }
        });

        this.booksPage.querySelectorAll('.toggle-public').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                this.togglePublicStatus(id, e.target);
            });
        });

    }

    async handleAddBook(e) {
        e.preventDefault();
        const form = e.target;
        const name = form.name.value.trim();
        const author = form.author.value.trim();
        const publishedYear = form.publishedYear.value;
        const categoryId = form.categoryId.value;
        // const description = form.description.value.trim();
        const review = form.review.value.trim();
        const coverImageFile = form.coverImage.files[0];

        if (!name) {
            showToast('Vui lòng nhập tên sách.', 'error', 1000);
            return;
        }

        if (!author) {
            showToast('Vui lòng nhập tên tác giả.', 'error', 1000);
            return;
        }
        if (!publishedYear) {
            showToast('Vui lòng nhập năm xuất bản.', 'error', 1000);
            return;
        }
        if (!categoryId) {
            showToast('Vui lòng chọn thể loại sách.', 'error', 1000);
            return;
        }
        if (!coverImageFile) {
            showToast('Vui lòng chọn ảnh bìa.', 'error', 1000);
            return;
        }
        const formData = new FormData();
        formData.append('name', name);
        formData.append('author', author);
        formData.append('publishedYear', publishedYear);
        formData.append('categoryId', categoryId);
        // formData.append('description', description);
        formData.append('review', review);
        formData.append('coverImage', coverImageFile);

        showLoading();
        try {

            const result = await addBook(formData);

            if (result.code === 200) {
                showToast(result.message, 'success', 1000);
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                showToast(result.message, 'error', 1000);
            }
        } catch (err) {
            console.error("Lỗi:", err);
            showToast(err.message, 'error', 1000);
        } finally {
            hideLoading();
        }
    }

    async handleEditBook(e) {
        e.preventDefault();
        const form = e.target;
        const id = form.id.value;
        const name = form.name.value.trim();
        const author = form.author.value.trim();
        const publishedYear = form.publishedYear.value;
        const categoryId = form.categoryId.value;
        // const description = form.description.value.trim();
        const review = form.review.value.trim();
        const coverImageFile = form.coverImage.files[0];

        if (!name) {
            showToast('Vui lòng nhập tên sách.', 'error', 1000);
            return;
        }

        if (!author) {
            showToast('Vui lòng nhập tên tác giả.', 'error', 1000);
            return;
        }
        if (!publishedYear) {
            showToast('Vui lòng nhập năm xuất bản.', 'error', 1000);
            return;
        }
        if (!categoryId) {
            showToast('Vui lòng chọn thể loại sách.', 'error', 1000);
            return;
        }

        const confirmed = await showConfirm("Bạn có chắc chắn muốn cập nhật thông tin?");
        if (!confirmed) {
            return;
        }

        const formData = new FormData();
        formData.append('id', id);
        formData.append('name', name);
        formData.append('author', author);
        formData.append('publishedYear', publishedYear);
        formData.append('categoryId', categoryId);
        // formData.append('description', description);
        formData.append('review', review);
        formData.append('coverImage', coverImageFile);

        showLoading();
        try {

            const result = await editBook(id, formData);

            if (result.code === 200) {
                showToast(result.message, 'success', 1000);
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                showToast(result.message, 'error', 1000);
            }
        } catch (err) {
            console.error("Lỗi:", err);
            showToast(err.message, 'error', 1000);
        } finally {
            hideLoading();
        }
    }


    async handleDeleteBook(id) {
        const confirmed = await showConfirm("Bạn có chắc chắn muốn xoá sách này?");
        if (!confirmed) {
            return;
        }

        showLoading();
        try {
            const result = await deleteBook(id);

            if (result.code === 200) {
                showToast(result.message, 'success', 1000);
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                showToast(result.message, 'error', 1000);
            }
        } catch (err) {
            console.error("Lỗi:", err);
            showToast(err.message, 'error', 1000);
        } finally {
            hideLoading();
        }
    }

    async togglePublicStatus(id, checkbox) {
        const confirmed = await showConfirm("Bạn có chắc chắn muốn cập nhật trạng thái của thể loại này?");
        if (!confirmed) {
            checkbox.checked = !checkbox.checked;
            return;
        }

        showLoading();
        try {
            const result = await updateBookStatus(id);

            if (result.code === 200) {
                showToast(result.message, 'success');
            } else {
                showToast(result.message || 'Có lỗi xảy ra', 'error');
                checkbox.checked = !checkbox.checked;
            }
        } catch (err) {
            console.error('Error toggling public status:', err);
            showToast('Lỗi khi cập nhật trạng thái', 'error');
            checkbox.checked = !checkbox.checked;
        } finally {
            hideLoading();
        }
    }

}


document.addEventListener('DOMContentLoaded', () => {
    new CategoriesPage();
});

export default CategoriesPage;
