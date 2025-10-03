import Sidebar from './module/sidebar.module.js';

class AppAdmin {
    constructor() {
        this.loadingModal = document.getElementById('loadingModal');
        this.toastModal = document.getElementById('toastModal');
        this.confirmModal = document.getElementById('confirmModal');

        this.toastTimeout = null;

        window.showLoading = this.showLoading.bind(this);
        window.hideLoading = this.hideLoading.bind(this);
        window.showToast = this.showToast.bind(this);
        window.showConfirm = this.showConfirm.bind(this);
    }

    showLoading() {
        this.loadingModal.classList.remove('d-none');
    }
    hideLoading() {
        this.loadingModal.classList.add('d-none');
    }
    showToast(message, type = 'success', duration = 3000) {
        const toastMessage = document.getElementById('toastMessage');

        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
            this.toastTimeout = null;
        }

        const icons = {
            success: '<i class="bi bi-check-circle-fill"></i>',
            error: '<i class="bi bi-x-circle-fill"></i>',
            warning: '<i class="bi bi-exclamation-triangle-fill"></i>',
            info: '<i class="bi bi-info-circle-fill"></i>'
        };

        // toastMessage.className = `toast-message ${type}`;
        // toastMessage.textContent = message;

        toastMessage.className = `toast-message ${type}`;
        toastMessage.innerHTML = `${icons[type] || ''} <span>${message}</span>`;

        this.toastModal.classList.remove('d-none');
        this.toastModal.classList.add('show');

        this.toastTimeout = setTimeout(() => {
            this.toastModal.classList.remove('show');
            this.toastTimeout = setTimeout(() => {
                this.toastModal.classList.add('d-none');
                this.toastTimeout = null; // reset
            }, 300);
        }, duration);
    }

    showConfirm(message = "Bạn có chắc chắn?") {
        return new Promise((resolve) => {
            const confirmMessage = document.getElementById('confirmMessage');
            const okBtn = document.getElementById('confirmOkBtn');
            const cancelBtn = document.getElementById('confirmCancelBtn');

            confirmMessage.textContent = message;
            this.confirmModal.classList.remove('d-none');

            const cleanup = () => {
                this.confirmModal.classList.add('d-none');
                okBtn.removeEventListener('click', onOk);
                cancelBtn.removeEventListener('click', onCancel);
            };

            const onOk = () => {
                cleanup();
                resolve(true);
            };

            const onCancel = () => {
                cleanup();
                resolve(false);
            };

            okBtn.addEventListener('click', onOk);
            cancelBtn.addEventListener('click', onCancel);
        });
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new AppAdmin();
    new Sidebar();
});

export default AppAdmin;
