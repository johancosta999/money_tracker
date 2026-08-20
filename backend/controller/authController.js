const User = require("../model/userModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");

const register = async(req, res) => {
    try {
        const { userName, email, password, age } = req.body;

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
        res.status(500).json({
            message : "Couldn't register the user",
            error : error.message
        })
    }
};

const login = async(req, res) => {
    try{
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });

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
                expiresIn: "1d"
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
        res.status(500).json({
            message : "Couldn't log the user",
            error : error.message
        })
    }
}

const getMe = async(req, res) => {
    try {
        const user = await User.findById(req.userId).select("-pasword");

        if(!user){
            return res.status(404).json({
                messgae : "User not found"
            })
        }

        res.status(200).json({
            user
        });

    } catch (error) {
        res.status(500).json({
            message : "Error getting user",
            error : error.message 
        })
    }

}

module.exports = { register, login, getMe };