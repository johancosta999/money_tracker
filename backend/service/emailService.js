// Sends email through Resend's HTTP API (https://resend.com) using Node's built-in fetch.
// Needs RESEND_API_KEY (and RESEND_FROM once you verify a domain). Without a key,
// emails are skipped and logged, so the app keeps working before email is set up.

const RESEND_URL = "https://api.resend.com/emails";

const isEmailConfigured = () => Boolean(process.env.RESEND_API_KEY);

// Returns true when Resend accepted the email
const sendEmail = async ({ to, subject, html, text }) => {
    if (!isEmailConfigured()) {
        console.warn("RESEND_API_KEY is not set; skipping email:", subject);
        return false;
    }

    const response = await fetch(RESEND_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            // Resend's shared test sender works until you verify your own domain
            from: process.env.RESEND_FROM || "Money Tracker <onboarding@resend.dev>",
            to: [to],
            subject,
            html,
            text
        })
    });

    if (!response.ok) {
        // Log Resend's reason server-side only
        console.error("Resend email failed:", response.status, await response.text());
        return false;
    }

    return true;
};

module.exports = { sendEmail, isEmailConfigured };
