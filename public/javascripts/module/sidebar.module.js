class Sidebar {
    constructor() {


        this.bindEvents();
    }

    bindEvents() {
        const logoutLink = document.getElementById('logoutLink');
        if (logoutLink) {
            logoutLink.addEventListener('click', async (e) => {
                e.preventDefault();

                try {
                    const res = await fetch('/logout', { method: 'POST' });

                    if (res.ok) {
                        window.location.href = '/';
                    } else {
                        window.showToast?.('Đăng xuất thất bại', 'error');
                    }
                } catch (err) {
                    console.error(err);
                    window.showToast?.('Lỗi kết nối', 'error');
                }
            });
        }
    }
}

export default Sidebar;