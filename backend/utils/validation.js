// Shared input checks used by the controllers.
// The browser forms validate too, but anyone can call the API directly,
// so the server must never trust what it receives.

// Simple "something@something.something" check with no spaces
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// One message so register and profile updates say the same thing
const PASSWORD_RULE = "Password must be at least 8 characters";

// typeof check rejects objects/arrays (e.g. NoSQL injection attempts);
// 254 is the maximum length of a real email address
const isValidEmail = (email) =>
    typeof email === "string" && email.length <= 254 && EMAIL_PATTERN.test(email);

// 8+ characters to resist guessing; 128 max stops huge strings
// from making bcrypt hashing slow
const isValidPassword = (password) =>
    typeof password === "string" && password.length >= 8 && password.length <= 128;

// Positive, finite money amount.
// Rejects negatives, zero, "abc" (NaN) and Infinity, which would break totals.
const isValidAmount = (amount) => {
    const value = Number(amount);
    return Number.isFinite(value) && value > 0;
};

module.exports = { isValidEmail, isValidPassword, isValidAmount, PASSWORD_RULE };
