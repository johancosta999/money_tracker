const User = require('../model/userModel')

const createUser = async(req, res) => {
    try{
        const { userName, email, password, age } = req.body;

        const newUser = new User(
            {
                userName,
                email, 
                password,
                age
            }
        );

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch(error) {
        res.status(500).json({
            message: "Error creating the user.",
            error: error.message
        });
    }
};

module.exports = { createUser }