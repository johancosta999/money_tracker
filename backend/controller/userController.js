const User = require('../model/userModel')
const Transaction = require('../model/transactionsModel')
const Planner = require('../model/moneyPlanModel')
const BankTransfer = require('../model/bankTransfersModel')
const Budget = require('../model/budgetModel')
const Category = require('../model/categoryModel')
const bcrypt = require('bcryptjs')
const { isValidEmail, isValidPassword, PASSWORD_RULE } = require('../utils/validation')

// Only the safe fields that are OK to send back to the browser (never the password hash)
const toPublicUser = (user) => ({
    id: user._id,
    _id: user._id,
    userName: user.userName,
    email: user.email,
    age: user.age
});

// Users can only ever act on their own account.
// req.userId comes from the verified JWT, so it can't be faked like the URL id can.
const isOwnAccount = (req) => req.params.id === String(req.userId);

// PUT /api/users/:id
// Only userName, email and password can be changed. Anything else in the body
// (e.g. _id, age, extra fields) is ignored, so users can't edit fields they shouldn't.
const updateUser = async(req, res, next) => {
    try {
        // Block editing someone else's profile
        if (!isOwnAccount(req)) {
            return res.status(403).json({
                message: "You can only update your own profile"
            });
        }

        // The password is hidden by default (select: false in the model),
        // so ask for it explicitly to check the current password below
        const user = await User.findById(req.userId).select("+password");

        if(!user) {
            return res.status(404).json({
                message : "User not found"
            });
        }

        const { userName, email, password, currentPassword } = req.body;

        // String() guards against objects being sent instead of text
        if (userName !== undefined) {
            const trimmed = String(userName).trim();
            if (!trimmed) {
                return res.status(400).json({ message: "Username cannot be empty" });
            }
            user.userName = trimmed;
        }

        // Emails are stored lowercase, so compare the same way
        const emailChanged = email !== undefined
            && String(email).trim().toLowerCase() !== user.email;

        // Changing login credentials needs the current password, so someone
        // using a stolen token or an unlocked phone can't take over the account
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
            // Don't allow switching to an email another account already uses
            if (await User.exists({ email: normalized })) {
                return res.status(400).json({ message: "That email is already in use" });
            }
            user.email = normalized;
        }

        // New passwords must follow the same rules as sign-up, and are always stored hashed
        if (password) {
            if (!isValidPassword(password)) {
                return res.status(400).json({ message: PASSWORD_RULE });
            }
            user.password = await bcrypt.hash(String(password), 10);
        }

        await user.save();

        res.status(200).json(toPublicUser(user));

    } catch (error) {
        // Unexpected errors go to the central error handler in app.js
        next(error);
    };
};

// DELETE /api/users/:id   body: { password }
// Deletes the user's own account and all of their data.
const deleteUser = async(req, res, next) => {
    try {
        // Block deleting someone else's account
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

        // Confirm with the password so an account can't be deleted by accident or with a stolen token
        const isCorrect = await bcrypt.compare(String(req.body?.password || ""), user.password);
        if (!isCorrect) {
            return res.status(400).json({
                message: "Password is incorrect"
            });
        }

        // Remove everything the user owns before the account itself,
        // so no orphaned financial data is left in the database.
        // Default categories are shared by everyone, so only custom ones are removed.
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
        // Unexpected errors go to the central error handler in app.js
        next(error);
    };
}

module.exports = { updateUser, deleteUser }
