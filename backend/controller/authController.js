const User = require("../model/userModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const { isValidEmail, isValidPassword, PASSWORD_RULE } = require("../utils/validation")

const register = async(req, res, next) => {
    try {
        const userName = String(req.body.userName ?? "").trim();
        const email = String(req.body.email ?? "").trim().toLowerCase();
        const password = req.body.password;
        const age = Number(req.body.age);

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
        next(error);
    }
};

const login = async(req, res, next) => {
    try{
        const email = String(req.body.email ?? "").trim().toLowerCase();
        const password = String(req.body.password ?? "");

        // Find user
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

        // Create JWT
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
        next(error);
    }
}

const getMe = async(req, res, next) => {
    try {
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
        next(error);
    }

}

module.exports = { register, login, getMe };
