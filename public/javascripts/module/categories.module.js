import {
    addCategory,
    editCategory,
    deleteCategory,
    updateCategoryStatus,
} from '../api/categories.api.js';

class CategoriesPage {
    constructor() {
        this.categoriesPage = document.querySelector('.categories-page');
        if (!this.categoriesPage) return;

        this.addCategoryForm = document.getElementById("addCategoryForm");
        this.editCategoryForm = document.getElementById("editCategoryForm");
        this.bindEvents();
    }

    bindEvents() {
        if (this.addCategoryForm) {
            this.addCategoryForm.addEventListener("submit", (e) => this.handleAddCategory(e));
        }

        if (this.editCategoryForm) {
            this.editCategoryForm.addEventListener("submit", (e) => this.handleEditCategory(e));
        }

        document.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-btn');
            if (editBtn) {
                const id = editBtn.dataset.id;
                const name = editBtn.dataset.name;
                const description = editBtn.dataset.description;

                this.editCategoryForm.id.value = id;
                this.editCategoryForm.name.value = name;
                this.editCategoryForm.description.value = description ? description : '';
            }

            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                const id = deleteBtn.dataset.id;
                this.handleDeleteCategory(id);
            }
        });


        document.addEventListener("click", (e) => {
            if (e.target.classList.contains("delete-category-btn")) {
                const id = e.target.dataset.id;
                this.handleDeleteCategory(id);
            }
        });

        this.categoriesPage.querySelectorAll('.toggle-public').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                this.togglePublicStatus(id, e.target);
            });
        });
    }

    async handleAddCategory(e) {
        e.preventDefault();
        const form = e.target;
        const name = form.name.value.trim();
        const description = form.description.value.trim();

        if (!name) {
            showToast('Vui lòng nhập tên thể loại.', 'error', 1000);
            return;
        }

        showLoading();
        try {
            const result = await addCategory({ name, description });

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

    async handleEditCategory(e) {
        e.preventDefault();
        const form = e.target;
        const id = form.id.value;
        const name = form.name.value.trim();
        const description = form.description.value.trim();

        if (!id) {
            showToast('Không tìm thấy thể loại cần chỉnh sửa.', 'error', 1000);
            return;
        }
        if (!name) {
            showToast('Vui lòng nhập tên thể loại.', 'error', 1000);
            return;
        }

        const confirmed = await showConfirm("Bạn có chắc chắn muốn cập nhật thông tin?");
        if (!confirmed) {
            return;
        }

        showLoading();
        try {
            const result = await editCategory(id, { name, description });

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

    async handleDeleteCategory(id) {
        const confirmed = await showConfirm("Bạn có chắc chắn muốn xoá thể loại này?");
        if (!confirmed) {
            return;
        }

        showLoading();
        try {
            // const response = await fetch(`/admin/categories/delete/${id}`, {
            //     method: "DELETE",
            // });

            // const result = await response.json();

            const result = await deleteCategory(id);

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
            const result = await updateCategoryStatus(id);

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
