import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../context/useAuth";
import api from "../services/api";
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
    password: ""
  });

  const startEditing = () => {
    setForm({ userName: user.userName || "", email: user.email || "", password: "" });
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

    try {
      const { data } = await api.put(`/users/${user.id || user._id}`, updates);
      const updatedUser = { ...user, id: data._id || user.id, userName: data.userName, email: data.email };
      login(updatedUser, localStorage.getItem("token"));
      setForm((current) => ({ ...current, password: "" }));
      setSuccess("Your profile has been updated.");
      setIsEditing(false);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "We couldn't update your profile. Please try again.");
    } finally {
      setIsSaving(false);
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
              <h1 id="profile-title">Your profile</h1>
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
                {isEditing ? <input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Leave blank to keep current password" autoComplete="new-password" minLength="6" /> : <p className="profile-value profile-password" aria-label="Password hidden">••••••••</p>}
              </div>
            </div>

            <div className="profile-actions">
              {isEditing ? <>
                <button type="button" className="profile-button profile-button-secondary" onClick={() => { setError(""); setIsEditing(false); }} disabled={isSaving}>Cancel</button>
                <button type="submit" className="profile-button profile-button-primary" disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</button>
              </> : <button type="button" className="profile-button profile-button-primary" onClick={startEditing}>Edit profile</button>}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default Profile
