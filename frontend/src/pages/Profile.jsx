import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../context/useAuth";
import api, { getErrorMessage } from "../services/api";
import "./Profile.css";

function Profile() {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    userName: user?.userName || "",
    email: user?.email || "",
    password: "",
    currentPassword: ""
  });

  const [showResetBox, setShowResetBox] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetForm, setResetForm] = useState({ email: "", password: "" });

  // Changing login credentials needs the current password (the backend enforces this too).
  // True when a new password is typed or the email differs from the saved one.
  const needsCurrentPassword =
    Boolean(form.password) || form.email.trim().toLowerCase() !== (user?.email || "");

  const startEditing = () => {
    setForm({ userName: user.userName || "", email: user.email || "", password: "", currentPassword: "" });
    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    const updates = { userName: form.userName.trim(), email: form.email.trim() };
    if (form.password) updates.password = form.password;
    // Only send the current password when the backend actually needs it
    if (needsCurrentPassword) updates.currentPassword = form.currentPassword;

    try {
      const { data } = await api.put(`/users/${user.id || user._id}`, updates);
      const updatedUser = { ...user, id: data._id || user.id, userName: data.userName, email: data.email };
      login(updatedUser, localStorage.getItem("token"));
      // Clear both password fields after saving so they aren't left in the form
      setForm((current) => ({ ...current, password: "", currentPassword: "" }));
      setSuccess("Your profile has been updated.");
      setIsEditing(false);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "We couldn't update your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // ---------- Reset totals ----------

  const openResetBox = () => {
    setResetForm({ email: "", password: "" });
    setResetError("");
    setResetSuccess("");
    setShowResetBox(true);
  };

  const closeResetBox = () => {
    if (isResetting) return;
    // Don't leave the password sitting in state after the box closes
    setResetForm({ email: "", password: "" });
    setShowResetBox(false);
  };

  const handleResetChange = (event) => {
    setResetForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setResetError("");
  };

  const handleReset = async (event) => {
    event.preventDefault();
    setResetError("");
    setIsResetting(true);

    try {
      await api.post(`/users/${user.id || user._id}/reset-totals`, {
        email: resetForm.email.trim(),
        password: resetForm.password
      });
      setResetForm({ email: "", password: "" });
      setShowResetBox(false);
      setResetSuccess("Your totals have been reset to zero.");
    } catch (requestError) {
      setResetError(getErrorMessage(requestError, "We couldn't reset your totals. Please try again."));
    } finally {
      setIsResetting(false);
    }
  };

  if (!user) return null;

  return (
    <main className="profile-page">
      <div className="profile-shell">
        <Link to="/dashboard" className="profile-back">← Back to dashboard</Link>

        <section className="profile-card" aria-labelledby="profile-title">
          <div className="profile-heading">
            <div className="profile-avatar" aria-hidden="true">{(user.userName || "U").charAt(0).toUpperCase()}</div>
            <div>
              <p className="profile-eyebrow">ACCOUNT SETTINGS</p>
              <h1 id="profile-title">Settings</h1>
              <p className="profile-subtitle">Keep your account details current and secure.</p>
            </div>
          </div>

          {error && <div className="profile-message profile-message-error" role="alert">{error}</div>}
          {success && <div className="profile-message profile-message-success" role="status">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="profile-fields">
              <div className="profile-field">
                <label htmlFor="userName">Username</label>
                {isEditing ? <input id="userName" name="userName" value={form.userName} onChange={handleChange} autoComplete="username" required /> : <p className="profile-value">{user.userName}</p>}
              </div>
              <div className="profile-field">
                <label htmlFor="email">Email address</label>
                {isEditing ? <input id="email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" required /> : <p className="profile-value">{user.email}</p>}
              </div>
              <div className="profile-field">
                <label htmlFor="password">Password</label>
                {isEditing ? <input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Leave blank to keep current password" autoComplete="new-password" minLength="8" /> : <p className="profile-value profile-password" aria-label="Password hidden">••••••••</p>}
              </div>
              {/* Only shown while changing email or password; minLength 8 above matches the backend rule */}
              {isEditing && needsCurrentPassword && (
                <div className="profile-field">
                  <label htmlFor="currentPassword">Current password</label>
                  <input id="currentPassword" name="currentPassword" type="password" value={form.currentPassword} onChange={handleChange} placeholder="Required to change email or password" autoComplete="current-password" required />
                </div>
              )}
            </div>

            <div className="profile-actions">
              {isEditing ? <>
                <button type="button" className="profile-button profile-button-secondary" onClick={() => { setError(""); setIsEditing(false); }} disabled={isSaving}>Cancel</button>
                <button type="submit" className="profile-button profile-button-primary" disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</button>
              </> : <button type="button" className="profile-button profile-button-primary" onClick={startEditing}>Edit profile</button>}
            </div>
          </form>
        </section>

        {/* Reset totals: keeps every transaction, the dashboard just starts counting from zero again */}
        <section className="profile-card reset-card" aria-labelledby="reset-title">
          <p className="profile-eyebrow reset-eyebrow">DANGER ZONE</p>
          <h2 id="reset-title">Reset totals</h2>
          <p className="profile-subtitle">
            Set your total income, total expense and bank totals on the dashboard back to zero.
            Your transactions are kept, they just won't be counted in the totals anymore.
          </p>

          {resetSuccess && <div className="profile-message profile-message-success reset-message" role="status">{resetSuccess}</div>}

          <div className="profile-actions">
            <button type="button" className="profile-button reset-button" onClick={openResetBox}>Reset totals to zero</button>
          </div>
        </section>
      </div>

      {showResetBox && (
        <div className="reset-overlay" role="presentation" onClick={closeResetBox}>
          <form
            className="reset-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-dialog-title"
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleReset}
          >
            <h2 id="reset-dialog-title">Confirm reset</h2>
            <p className="profile-subtitle">Enter your email and password to reset your totals to zero.</p>

            {resetError && <div className="profile-message profile-message-error reset-message" role="alert">{resetError}</div>}

            <div className="reset-field">
              <label htmlFor="resetEmail">Email address</label>
              <input id="resetEmail" name="email" type="email" value={resetForm.email} onChange={handleResetChange} autoComplete="email" required autoFocus />
            </div>
            <div className="reset-field">
              <label htmlFor="resetPassword">Password</label>
              <input id="resetPassword" name="password" type="password" value={resetForm.password} onChange={handleResetChange} autoComplete="current-password" required />
            </div>

            <div className="profile-actions">
              <button type="button" className="profile-button profile-button-secondary" onClick={closeResetBox} disabled={isResetting}>Cancel</button>
              <button type="submit" className="profile-button reset-button" disabled={isResetting}>{isResetting ? "Resetting..." : "Confirm reset"}</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

export default Profile
