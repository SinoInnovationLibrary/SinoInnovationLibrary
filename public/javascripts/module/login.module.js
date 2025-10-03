class LoginPage {
    constructor() {
        this.loginForm = document.getElementById('loginForm');
        this.bindEvents();
    }

    bindEvents() {
        this.loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            showLoading();

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username,
                        password
                    })
                });

                const result = await response.json();

                if (result.code === 200) {
                    showToast(result.message, 'success', 1000);
                    setTimeout(() => {
                        location.href = '/admin/books';
                    }, 1000);
                } else {
                    showToast(result.message, 'error', 1000);
                }
            } catch (err) {
                showToast(err.message, 'error', 1000);

            } finally {
                hideLoading();
            }
        });
    }


}


document.addEventListener('DOMContentLoaded', () => {
    new LoginPage();
});

export default LoginPage;