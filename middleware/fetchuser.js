const jwt = require('jsonwebtoken');
require('dotenv').config();

const fetchuser = (req, res, next) => {
    try {
        const token = req.cookies['authToken'];
        const user = jwt.verify(token, process.env.AUTH_SECRET);
        req.user = user._id;
        next();
    } catch (error) {
        console.log(error);
    }
}

module.exports = fetchuser;
