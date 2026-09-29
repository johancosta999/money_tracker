import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../services/api";
import "./AddTransaction.css";

// Labels for the "whose money" choice, per transaction type
const sourceOptions = {
  Deposit: {
    own: "My own money",
    external: "From someone else",
  },
  Transfer: {
    own: "To my own account",
    external: "To someone else",
  },
};

const getBalanceEffect = (type, external) => {
  if (type === "Withdraw") {
    return "Doesn't change your balance. Log it as an expense when you spend it.";
  }

  if (!external) {
    return "Doesn't change your balance. You're only moving your own money.";
  }

  return type === "Deposit"
    ? "Increases your current balance."
    : "Decreases your current balance.";
};

function AddBankTransaction() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: "Deposit",
    amount: "",
    external: false,
    date: new Date().toISOString().split("T")[0],
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

  const handleSourceChange = (external) => {
    setFormData({
      ...formData,
      external,
    });
  };

  const isWithdraw = formData.type === "Withdraw";
  const affectsBalance = !isWithdraw && formData.external;
  const effectClass = !affectsBalance
    ? "neutral-effect"
    : formData.type === "Deposit"
      ? "increase-effect"
      : "decrease-effect";

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }

    setLoading(true);

    try {
      await api.post("/bank/create-transaction", {
        type: formData.type,

        amount: Number(formData.amount),

        external: affectsBalance,

        date: formData.date,

        description: formData.description,
      });

      setSuccess("Bank transaction added successfully");

      setTimeout(() => {
        navigate("/bank-transactions");
      }, 800);
    } catch (error) {
      setError(getErrorMessage(error, "Couldn't create bank transaction"));
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

              <p>Record deposits, withdrawals and transfers.</p>
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

          {!isWithdraw && (
            <div className="input-group">
              <label>Whose Money?</label>

              <div className="type-selector">
                <button
                  type="button"
                  className={
                    !formData.external
                      ? "type-button active own-source"
                      : "type-button"
                  }
                  onClick={() => handleSourceChange(false)}
                  disabled={loading}
                >
                  ⇄ {sourceOptions[formData.type].own}
                </button>

                <button
                  type="button"
                  className={
                    formData.external
                      ? `type-button active ${formData.type === "Deposit" ? "income-type" : "expense-type"}`
                      : "type-button"
                  }
                  onClick={() => handleSourceChange(true)}
                  disabled={loading}
                >
                  {formData.type === "Deposit" ? "↓" : "↑"}{" "}
                  {sourceOptions[formData.type].external}
                </button>
              </div>
            </div>
          )}

          <p className={`balance-effect-hint ${effectClass}`}>
            {getBalanceEffect(formData.type, formData.external)}
          </p>

          <div className="form-row">
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
              <label>Date</label>

              <input
                type="date"
                name="date"
                value={formData.date}
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
