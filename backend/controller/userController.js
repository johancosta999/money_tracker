const User = require('../model/userModel')
const Transaction = require('../model/transactionsModel')
const Planner = require('../model/moneyPlanModel')
const BankTransfer = require('../model/bankTransfersModel')
const Budget = require('../model/budgetModel')
const Category = require('../model/categoryModel')
const bcrypt = require('bcryptjs')
const { isValidEmail, isValidPassword, PASSWORD_RULE } = require('../utils/validation')

const toPublicUser = (user) => ({
    id: user._id,
    _id: user._id,
    userName: user.userName,
    email: user.email,
    age: user.age
});

// Users can only ever act on their own account
const isOwnAccount = (req) => req.params.id === String(req.userId);

const updateUser = async(req, res, next) => {
    try {
        if (!isOwnAccount(req)) {
            return res.status(403).json({
                message: "You can only update your own profile"
            });
        }

        const user = await User.findById(req.userId).select("+password");

        if(!user) {
            return res.status(404).json({
                message : "User not found"
            });
        }

        const { userName, email, password, currentPassword } = req.body;

        if (userName !== undefined) {
            const trimmed = String(userName).trim();
            if (!trimmed) {
                return res.status(400).json({ message: "Username cannot be empty" });
            }
            user.userName = trimmed;
        }

        const emailChanged = email !== undefined
            && String(email).trim().toLowerCase() !== user.email;

        // Changing login credentials needs the current password
        if (emailChanged || password) {
            const isCorrect = await bcrypt.compare(String(currentPassword || ""), user.password);
            if (!isCorrect) {
                return res.status(400).json({
                    message: "Current password is incorrect"
                });
            }
        }

        if (emailChanged) {
            const normalized = String(email).trim().toLowerCase();
            if (!isValidEmail(normalized)) {
                return res.status(400).json({ message: "Please enter a valid email address" });
            }
            if (await User.exists({ email: normalized })) {
                return res.status(400).json({ message: "That email is already in use" });
            }
            user.email = normalized;
        }

        if (password) {
            if (!isValidPassword(password)) {
                return res.status(400).json({ message: PASSWORD_RULE });
            }
            user.password = await bcrypt.hash(String(password), 10);
        }

        await user.save();

        res.status(200).json(toPublicUser(user));

    } catch (error) {
        next(error);
    };
};

const deleteUser = async(req, res, next) => {
    try {
        if (!isOwnAccount(req)) {
            return res.status(403).json({
                message: "You can only delete your own account"
            });
        }

        const user = await User.findById(req.userId).select("+password");

        if(!user) {
            return res.status(404).json({
                message : "User not found",
            });
        }

        const isCorrect = await bcrypt.compare(String(req.body?.password || ""), user.password);
        if (!isCorrect) {
            return res.status(400).json({
                message: "Password is incorrect"
            });
        }

        // Remove everything the user owns before the account itself
        await Promise.all([
            Transaction.deleteMany({ user: user._id }),
            Planner.deleteMany({ userId: user._id }),
            BankTransfer.deleteMany({ userId: user._id }),
            Budget.deleteMany({ userId: user._id }),
            Category.deleteMany({ userId: user._id, isDefault: false })
        ]);

        await user.deleteOne();

        res.status(200).json({
            message : "Account deleted successfully"
        });

    } catch (error){
        next(error);
    };
}

module.exports = { updateUser, deleteUser }
