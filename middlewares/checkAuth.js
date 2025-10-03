const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const { createAccessToken, createRefreshToken, verifyAccessToken, verifyRefreshToken } = require('../utils/jwt');
// const { getImageUrl, getOrCreateMediaToken } = require('../utils/utils');


// const User = require('../models/user.model');
// const RefreshToken = require('../models/refreshToken.model');
const {
    ADMIN_USERNAME,
    ADMIN_PASSWORD,
    COOKIE_MAX_AGE
} = process.env;

const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};


const authAdmin = asyncHandler(async (req, res, next) => {
    let token = req.cookies.token;
    const refreshToken = req.cookies.refreshToken;

    let decoded;

    if (token) {
        try {
            decoded = verifyAccessToken(token);
        } catch (err) {
            console.warn('Access token hết hạn hoặc không hợp lệ:', err.message);
        }
    }

    if (!decoded && refreshToken) {
        try {

            const decodedRefresh = verifyRefreshToken(refreshToken);

            if (!decodedRefresh.username || decodedRefresh.username != ADMIN_USERNAME) {
                return res.redirect('/403');
            }

            token = createAccessToken({ username: ADMIN_USERNAME});
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: COOKIE_MAX_AGE || 15 * 60 * 1000,
            });
            return next();
        } catch (err) {
            console.log(err.message)
            return res.redirect('/login');
        }
    }
    if (!decoded) {
        return res.redirect('/login');
    }

    if (!decoded.username || decoded.username != ADMIN_USERNAME) {
        return res.redirect('/403');
    }
    next();
});

const redirectIfAuthenticated = async (req, res, next) => {
    const token = req.cookies.token;
    const refreshToken = req.cookies.refreshToken;

    let decoded = null;
    if (token) {
        try {
            decoded = verifyAccessToken(token);
        } catch (_) { }
    }

    if (!decoded && refreshToken) {
        try {
            const decodedRefresh = verifyRefreshToken(refreshToken);
            if (!decodedRefresh.username || decodedRefresh.username != ADMIN_USERNAME ) {
                return res.redirect('/403');
            }

            token = createAccessToken({ username: ADMIN_USERNAME });
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: COOKIE_MAX_AGE || 15 * 60 * 1000,
            });

            return res.redirect('/');
        } catch (_) {
            return next();
        }
    }

    if (!decoded) return next();

    if (!decoded.username || decoded.username != ADMIN_USERNAME) {
        return next();
    }

    return res.redirect('/');
};

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 10, // Tối đa 10 lần login trong 15 phút
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        return res.status(500).json({
            code: 500,
            message: 'Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 15 phút.',
            data: null
        });
    }
});

module.exports = {
    asyncHandler,
    redirectIfAuthenticated,
    loginLimiter,
    authAdmin,
};