const jwt = require("jsonwebtoken")

const protect = async(req, res, next) => {
    try{
        const authHeader = req.headers.authorization;

        if(!authHeader) {
            return res.status(401).json({
                message: "No authization token provided"
            })
        }

        const [scheme, token] = authHeader.split(" ");

        if(scheme !== "Bearer" || !token) {
            return res.status(401).json({
                message : "Invalid authorization format"
            })
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.userId = decoded.userId;

        next()

    } catch (error) {
        return res.status(401).json({
            message : "Invalid token or expired authorization"
        })
    }
}

module.exports = protect;