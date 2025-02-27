const jwt = require('jsonwebtoken')
const { JWT_SECRET_ADMIN } = require('../config')

function adminMiddleware(req, res, next) {
    const token = req.headers.token;
    try{
        const decoded = jwt.verify(token, JWT_SECRET_ADMIN);
        if(decoded) {
            req.userId = decoded.id
            next();
        } else {
            res.status(403).json({
                msg: "You are not signed in"
            })
        }
    } catch(e) {
        console.error(e)
        res.status(500).json({
            msg: e
        })
    }
}

module.exports = {
    adminMiddleware: adminMiddleware
}