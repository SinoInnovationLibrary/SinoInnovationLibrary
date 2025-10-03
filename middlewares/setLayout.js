function setAdminLayout(req, res, next) {
    res.locals.layout = 'admin.layout.hbs';
    const cleanPath = req.originalUrl.split('?')[0];
    const match = cleanPath.match(/^\/admin\/([^\/]+)/);
    res.locals.active = match ? match[1] : 'category';
    next();
}

function setAuthLayout(req, res, next) {
    res.locals.layout = 'auth.layout.hbs';
    next();
}

function setUserLayout(req, res, next) {
    res.locals.layout = 'user.layout.hbs';
    next();
}

module.exports = {
    setAdminLayout,
    setAuthLayout,
    setUserLayout
};
