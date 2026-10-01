const jwt = require("jsonwebtoken")

const protect = async(req, res, next) => {
    try{
        const authHeader = req.headers.authorization;

        if(!authHeader) {
            return res.status(401).json({
                message: "No authization token provided"
            })
        }

        // Header must look exactly like "Bearer <token>"
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
        // Don't send error.message: it reveals why the token failed (expired, bad signature, etc.)
        return res.status(401).json({
            message : "Invalid token or expired authorization"
        })
    }
}

module.exports = protect;