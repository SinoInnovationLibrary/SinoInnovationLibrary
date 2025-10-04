
const { createAccessToken, createRefreshToken } = require('../../utils/jwt');

const {
    ADMIN_USERNAME,
    ADMIN_PASSWORD,
    COOKIE_MAX_AGE
} = process.env;

class AuthController {
    async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !username.trim()) {
                return res.status(400).json({
                    code: 400,
                    message: 'Vui lòng nhập tên đăng nhập.',
                    data: null
                });
            }
            if (!password || !password.trim()) {
                return res.status(400).json({
                    code: 400,
                    message: 'Vui lòng nhập mật khẩu.',
                    data: null
                });
            }

            // So sánh với giá trị trong .env
            const trimmedUsername = username.trim();

            const invalidLogin =
                trimmedUsername !== ADMIN_USERNAME ||
                password !== ADMIN_PASSWORD;

            if (invalidLogin) {
                return res.status(400).json({
                    code: 400,
                    message: 'Tên đăng nhập hoặc mật khẩu không đúng.',
                    data: null
                });
            }

            // Tạo access token và refresh token
            const accessToken = createAccessToken({ username: ADMIN_USERNAME });
            const refreshToken = createRefreshToken({ username: ADMIN_USERNAME });

            // Gửi cookie
            res.cookie('token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 1 * 60 * 60 * 1000, // 15 phút
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 1 * 60 * 60 * 1000, // 7 ngày
            });
            return res.status(200).json({
                code: 200,
                message: 'Đăng nhập thành công!',
                data: null
            });


        } catch (err) {
            console.error('Lỗi khi đăng nhập:', err);
            return res.status(500).json({
                code: 500,
                message: 'Đã xảy ra lỗi máy chủ.',
                data: null
            });
        }
    }

    async logout(req, res) {
        try {
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
            });

            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
            });

            return res.status(200).json({
                code: 200,
                message: 'Đăng xuất thành công!',
                data: null
            });

        } catch (err) {
            console.error('Lỗi khi đăng xuất:', err);
            return res.status(500).json({
                code: 500,
                message: 'Đã xảy ra lỗi khi đăng xuất.',
                data: null
            });
        }
    }
}

module.exports = new AuthController();

