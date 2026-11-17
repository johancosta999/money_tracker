import { Link } from "react-router-dom";
import "./Profile.css";

// Plain-language privacy policy. Reuses the Settings page card styles.
// Update the "Last updated" date whenever this text changes.
const LAST_UPDATED = "17 November 2026";

function Privacy() {
    return (
        <main className="profile-page">
            <div className="profile-shell">
                <Link to="/" className="profile-back">← Back to home</Link>

                <article className="profile-card privacy-card" aria-labelledby="privacy-title">
                    <p className="profile-eyebrow">MONEY TRACKER</p>
                    <h1 id="privacy-title">Privacy Policy</h1>
                    <p className="profile-subtitle">Last updated: {LAST_UPDATED}</p>

                    <h2>What we store</h2>
                    <ul>
                        <li>Your account details: username, email address and age.</li>
                        <li>Your password, stored only as a secure hash. Nobody can read it, including us.</li>
                        <li>
                            What you enter in the app: transactions, bank transactions, planners, categories
                            and notes.
                        </li>
                    </ul>

                    <h2>Why we store it</h2>
                    <p>
                        Only to run the app for you: showing your balance, planners and history, and letting
                        you log in. We don't sell your data, show ads or share it with advertisers.
                    </p>

                    <h2>Services we use</h2>
                    <ul>
                        <li>A cloud database host keeps your data.</li>
                        <li>An email service sends password-reset emails to the address you give.</li>
                        <li>
                            An error-monitoring service may receive technical details when something breaks, so
                            we can fix it. We don't send your transactions to it on purpose.
                        </li>
                    </ul>

                    <h2>On your device</h2>
                    <p>
                        Your browser keeps your login token and your light/dark theme choice. Logging out
                        removes the login token.
                    </p>

                    <h2>Your choices</h2>
                    <ul>
                        <li>Edit your username, email and password any time in Settings.</li>
                        <li>
                            Delete your account in Settings. This permanently removes your account and everything
                            you entered.
                        </li>
                    </ul>

                    <h2>Changes</h2>
                    <p>If this policy changes, the date above will be updated.</p>
                </article>
            </div>
        </main>
    );
}

export default Privacy;
