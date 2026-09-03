const User = require('../model/userModel')
const bcrypt = require('bcryptjs')

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

        if (id !== req.userId) {
            return res.status(403).json({
                message: "You can only update your own profile"
            });
        }

        const updates = { ...req.body };

        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const user = await User.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true, select: "-password" }
        );

        //if cant find the user
        if(!user) {
            return res.status(400).json({
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