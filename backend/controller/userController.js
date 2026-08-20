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

const getUsers = async(req, res) => {
    try{
        //fetch all the users from the database
        const users = await User.find();

        //return the list of users 
        res.status(200).json(users)
        
    } catch (error) {
        res.status(500).json({
            message : " Couldn't retrieve users",
            error : error.message
        });
    }
};

const getUser = async(req, res) => {
    try{
        //get the user id
        const { id } = req.params;

        //fetching
        const user = await User.findById(id);

        //if cant find the user
        if(!user) {
            return res.status(404).json({
                message: "User not found :(",
                error : error.message
            });
        }

        //respond
        res.status(200).json(user);

    } catch (error) {
        res.status(500).json({
            message: "Couldn't find the user you looking for :(",
            error : error.message
        });
    };
};

const updateUser = async(req, res) => {
    try {
        //get the id 
        const { id } = req.params;

        // update the user with new data from req.body
        const user = await User.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true } //return updated doc, validate schema
        );

        //if cant find the user
        if(!user) {
            res.status(400).json({
                message : "Coundn't find the user"
            });
        }

        //respond
        res.status(200).json(user);

    } catch (error) {
        res.status(500).json({
            message : "Could't upate the user",
            error : error.message
        })
    };
};

const deleteUser = async(req, res) => {
    try {
        //get the id 
        const { id } = req.params;

        //delete
        const user = await User.findByIdAndDelete(id);

        //if cant find the user 
        if(!user) {
            return res.status(404).json({
                message : "Coudn't find the user",
            });
        }

        //respon
        res.status(200).json({
            message : "User deleted successfully",
            deletedUser: user
        });

    } catch (error){
        res.status(500).json({
            message : "Coouldn't delete the user.",
            error : error.message
        })
    };
}

module.exports = { createUser, getUsers, getUser, updateUser, deleteUser }