const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../model/userModel");
const PasswordReset = require("../model/passwordResetModel");
const { sendEmail } = require("../service/emailService");
const { isValidEmail, isValidPassword, PASSWORD_RULE } = require("../utils/validation");

// Reset links stop working after 30 minutes
const TOKEN_LIFETIME_MS = 30 * 60 * 1000;

// Same reply whether or not the email has an account,
// so this endpoint can't be used to find out who is registered
const GENERIC_REPLY = {
    message: "If an account exists for that email, a reset link has been sent. Check your inbox."
};

const INVALID_LINK = { message: "This reset link is invalid or has expired" };

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

// The site the link should open. FRONTEND_URL is set in production;
// localhost is the Vite dev server.
const getFrontendUrl = () =>
    (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");

// User names go into the HTML email, so escape them
const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" };
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

// POST /api/auth/forgot-password   body: { email }
const forgotPassword = async (req, res, next) => {
    try {
        const email = String(req.body?.email ?? "").trim().toLowerCase();

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Please enter a valid email address" });
        }

        const user = await User.findOne({ email });

        if (user) {
            // Only the newest link works: remove older unused ones
            await PasswordReset.deleteMany({ userId: user._id });

            const token = crypto.randomBytes(32).toString("hex");

            await PasswordReset.create({
                userId: user._id,
                tokenHash: hashToken(token),
                expiresAt: new Date(Date.now() + TOKEN_LIFETIME_MS)
            });

            const link = `${getFrontendUrl()}/reset-password?token=${token}`;

            // Email problems are logged but never change the reply (see GENERIC_REPLY)
            try {
                await sendEmail({
                    to: user.email,
                    subject: "Reset your Money Tracker password",
                    text:
                        `Hi ${user.userName},\n\n` +
                        `Use this link to choose a new password (valid for 30 minutes):\n${link}\n\n` +
                        "If you didn't ask for this, you can ignore this email.",
                    html:
                        `<p>Hi ${escapeHtml(user.userName)},</p>` +
                        `<p><a href="${link}">Choose a new password</a> (link valid for 30 minutes).</p>` +
                        "<p>If you didn't ask for this, you can ignore this email.</p>"
                });
            } catch (emailError) {
                console.error("Couldn't send reset email:", emailError);
            }
        }

        res.status(200).json(GENERIC_REPLY);

    } catch (error) {
        next(error);
    }
};

// POST /api/auth/reset-password   body: { token, password }
const resetPassword = async (req, res, next) => {
    try {
        const token = req.body?.token;
        const password = req.body?.password;

        // Tokens are 64 hex characters; anything else can't be valid
        if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
            return res.status(400).json(INVALID_LINK);
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({ message: PASSWORD_RULE });
        }

        const reset = await PasswordReset.findOne({
            tokenHash: hashToken(token),
            expiresAt: { $gt: new Date() }
        });

        if (!reset) {
            return res.status(400).json(INVALID_LINK);
        }

        const user = await User.findById(reset.userId);

        if (!user) {
            await reset.deleteOne();
            return res.status(400).json(INVALID_LINK);
        }

        user.password = await bcrypt.hash(password, 10);
        await user.save();

        // Links are single-use
        await PasswordReset.deleteMany({ userId: user._id });

        res.status(200).json({ message: "Your password has been changed. You can log in now." });

    } catch (error) {
        next(error);
    }
};

module.exports = { forgotPassword, resetPassword };
