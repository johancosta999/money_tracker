const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_RULE = "Password must be at least 8 characters";

const isValidEmail = (email) =>
    typeof email === "string" && email.length <= 254 && EMAIL_PATTERN.test(email);

const isValidPassword = (password) =>
    typeof password === "string" && password.length >= 8 && password.length <= 128;

// Positive, finite money amount
const isValidAmount = (amount) => {
    const value = Number(amount);
    return Number.isFinite(value) && value > 0;
};

module.exports = { isValidEmail, isValidPassword, isValidAmount, PASSWORD_RULE };
