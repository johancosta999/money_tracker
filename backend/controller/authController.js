const User = require("../model/userModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const { isValidEmail, isValidPassword, PASSWORD_RULE } = require("../utils/validation")

const register = async(req, res, next) => {
    try {
        // Force inputs into plain strings/numbers. This blocks NoSQL injection,
        // e.g. sending { "$ne": null } as the email to match any user.
        // Emails are lowercased so "Alice@X.com" and "alice@x.com" are the same account.
        const userName = String(req.body.userName ?? "").trim();
        const email = String(req.body.email ?? "").trim().toLowerCase();
        const password = req.body.password;
        const age = Number(req.body.age);

        // Validate everything on the server too; the browser form can be bypassed
        if (!userName) {
            return res.status(400).json({ message: "Username is required" });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Please enter a valid email address" });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({ message: PASSWORD_RULE });
        }

        if (!Number.isInteger(age) || age < 1 || age > 120) {
            return res.status(400).json({ message: "Please enter a valid age" });
        }

        //check if user already exists
        const existingUser = await User.findOne({ email });

        if(existingUser) {
            return res.status(400).json({
                message : "User already exists"
            })
        }

        //hash password
        const hashPassword = await bcrypt.hash(password, 10)

        //create user
        const newUser = new User({
            userName,
            email,
            password : hashPassword,
            age
        })

        const savedUser = await newUser.save()
        res.status(201).json({
            message : "User created successfully",
            user : {
                id : savedUser._id,
                userName : savedUser.userName,
                email : savedUser.email,
                age : savedUser.age
            }
        });

    } catch (error){
        // Unexpected errors go to the central error handler in app.js
        next(error);
    }
};

const login = async(req, res, next) => {
    try{
        // Same as register: plain strings only (blocks NoSQL injection), lowercase email
        const email = String(req.body.email ?? "").trim().toLowerCase();
        const password = String(req.body.password ?? "");

        // Find user. The password hash is hidden by default (select: false
        // in the model), so it has to be requested here to compare it.
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // Create JWT. Lasts 30 days so people using the installed
        // phone app don't have to log in again every day.
        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "30d"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                age: user.age
            }
        });
    } catch(error) {
        // Unexpected errors go to the central error handler in app.js
        next(error);
    }
}

const getMe = async(req, res, next) => {
    try {
        // No .select("-password") needed: the model hides the password by default
        const user = await User.findById(req.userId).lean();

        if(!user){
            return res.status(404).json({
                message : "User not found"
            })
        }

        res.status(200).json({
            user
        });

    } catch (error) {
        // Unexpected errors go to the central error handler in app.js
        next(error);
    }

}

module.exports = { register, login, getMe };
