import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AddTransaction.css";

function AddBankTransaction() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: "Deposit",
    amount: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTypeChange = (type) => {
    setFormData({
      ...formData,
      type,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bank/create-transaction`,

        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            type: formData.type,

            amount: Number(formData.amount),

            description: formData.description,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Couldn't create bank transaction");
      }

      setSuccess("Bank transaction added successfully");

      setTimeout(() => {
        navigate("/bank-transactions");
      }, 800);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-transaction-page">
      <div className="add-transaction-card">
        <div className="add-transaction-header">
          <Link to="/bank-transactions" className="back-link">
            ← Bank Transactions
          </Link>

          <div className="transaction-title">
            <div className="transaction-title-icon">🏦</div>

            <div>
              <p className="transaction-label">MONEY TRACKER</p>

              <h1>Add Bank Transaction</h1>

              <p>Record deposits and withdrawals.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="transaction-message error-message">{error}</div>
        )}

        {success && (
          <div className="transaction-message success-message">{success}</div>
        )}

        <form className="transaction-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Transaction Type</label>

            <div className="type-selector">
              <button
                type="button"
                className={
                  formData.type === "Deposit"
                    ? "type-button active income-type"
                    : "type-button"
                }
                onClick={() => handleTypeChange("Deposit")}
              >
                ↑ Deposit
              </button>

              <button
                type="button"
                className={
                  formData.type === "Withdraw"
                    ? "type-button active expense-type"
                    : "type-button"
                }
                onClick={() => handleTypeChange("Withdraw")}
              >
                ↓ Withdraw
              </button>

              <button
                type="button"
                className={
                  formData.type === "Transfer"
                    ? "type-button active transfer-type"
                    : "type-button"
                }
                onClick={() => handleTypeChange("Transfer")}
              >
                → Transfer
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>Amount</label>

            <div className="amount-input">
              <span>LKR</span>

              <input
                type="number"
                name="amount"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Description</label>

            <textarea
              name="description"
              rows="4"
              placeholder="Example: Salary deposit, ATM withdrawal..."
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <button
            className="submit-transaction"
            type="submit"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Bank Transaction"}
          </button>
        </form>

        <Link to="/bank-transactions" className="cancel-link">
          Cancel
        </Link>
      </div>
    </div>
  );
}

export default AddBankTransaction;
