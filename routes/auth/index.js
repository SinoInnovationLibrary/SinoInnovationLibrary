const express = require('express');
const router = express.Router();

const { asyncHandler, redirectIfAuthenticated, loginLimiter } = require('../../middlewares/checkAuth');

const AuthController = require('../../controllers/auth/auth.controller');
const { setAuthLayout } = require('../../middlewares/setLayout');

router.use(setAuthLayout);
router.get('/login', redirectIfAuthenticated, async function (req, res) {
    res.render('pages/auth/login.page.hbs', {
        title: 'Login',
    });
});
router.post('/login', loginLimiter, asyncHandler(AuthController.login));
router.post('/logout', asyncHandler(AuthController.logout));

router.get('/403', (req, res) => {
    res.status(403).render('pages/auth/403.page.hbs', {
        title: 'Không có quyền truy cập',
    });
});

module.exports = router;