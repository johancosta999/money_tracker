import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../services/api";
import { DEFAULT_CATEGORIES } from "../utils/categories";
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

  // On /bank-transactions/:id/edit this page edits an existing bank transaction
  const { id: editId } = useParams();
  const isEditing = Boolean(editId);
  const [loadingExisting, setLoadingExisting] = useState(isEditing);

  const [formData, setFormData] = useState({
    type: "Deposit",
    amount: "",
    external: false,
    category: DEFAULT_CATEGORIES[0],
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Planner is optional for bank transactions ("" = no planner)
  const [plannerOptions, setPlannerOptions] = useState([]);
  const [selectedPlannerId, setSelectedPlannerId] = useState("");

  useEffect(() => {
    const ignore = { current: false };

    const fetchPlanners = async () => {
      try {
        const [{ data }, existing] = await Promise.all([
          api.get("/plan"),
          editId ? api.get(`/bank/bank-transaction/${editId}`) : Promise.resolve(null),
        ]);

        if (ignore.current) return;

        if (existing) {
          // Prefill the form with the saved bank transaction
          const transaction = existing.data;
          setSelectedPlannerId(transaction.plannerId?._id || transaction.plannerId || "");
          setFormData({
            type: transaction.type,
            amount: String(transaction.amount ?? ""),
            external: Boolean(transaction.external),
            // Older bank transactions have no category: start on the first one
            category: transaction.category || DEFAULT_CATEGORIES[0],
            date: new Date(transaction.date || transaction.createdAt).toISOString().split("T")[0],
            description: transaction.description || "",
          });
        }

        // Newest planner first
        const sortedPlans = (Array.isArray(data) ? data : []).sort(
          (a, b) => new Date(b.startDate) - new Date(a.startDate),
        );

        setPlannerOptions(sortedPlans);
      } catch (fetchError) {
        if (!ignore.current) {
          setError(getErrorMessage(
            fetchError,
            editId ? "Couldn't load this bank transaction" : "Couldn't load planners",
          ));
        }
      } finally {
        if (!ignore.current) setLoadingExisting(false);
      }
    };

    fetchPlanners();

    return () => {
      ignore.current = true;
    };
  }, [editId]);

  // Same categories as normal transactions: the chosen planner's, or the defaults
  const selectedPlanner = plannerOptions.find((planner) => planner._id === selectedPlannerId);
  const plannerCategories = selectedPlanner?.categories?.length
    ? selectedPlanner.categories
    : DEFAULT_CATEGORIES;

  // When editing, keep the saved category selectable even if the planner no longer lists it
  const availableCategories =
    isEditing && formData.category && !plannerCategories.includes(formData.category)
      ? [formData.category, ...plannerCategories]
      : plannerCategories;

  const handlePlannerChange = (plannerId) => {
    setSelectedPlannerId(plannerId);

    // Keep the category if the new planner has it, otherwise pick its first one
    const planner = plannerOptions.find((option) => option._id === plannerId);
    const categories = planner?.categories?.length ? planner.categories : DEFAULT_CATEGORIES;

    setFormData((previous) => ({
      ...previous,
      category: categories.includes(previous.category) ? previous.category : categories[0],
    }));
  };

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

    if (!formData.category) {
      setError("Please choose a category");
      return;
    }

    setLoading(true);

    try {
      const body = {
        type: formData.type,

        amount: Number(formData.amount),

        external: affectsBalance,

        category: formData.category,

        date: formData.date,

        description: formData.description,

        plannerId: selectedPlannerId || null,
      };

      if (isEditing) {
        await api.put(`/bank/update-transaction/${editId}`, body);
        setSuccess("Bank transaction updated successfully");
      } else {
        const { data } = await api.post("/bank/create-transaction", body);

        // Debt deposits are also saved to Notes by the server
        setSuccess(
          data?.noteCreated
            ? "Bank transaction added and saved to your notes"
            : "Bank transaction added successfully",
        );
      }

      setTimeout(() => {
        navigate("/bank-transactions");
      }, 800);
    } catch (error) {
      setError(getErrorMessage(
        error,
        isEditing ? "Couldn't update bank transaction" : "Couldn't create bank transaction",
      ));
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
            <div className="transaction-title-icon">{isEditing ? "✎" : "🏦"}</div>

            <div>
              <p className="transaction-label">MONEY TRACKER</p>

              <h1>{isEditing ? "Edit Bank Transaction" : "Add Bank Transaction"}</h1>

              <p>
                {isEditing
                  ? "Change the details and save."
                  : "Record deposits, withdrawals and transfers."}
              </p>
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
            <label htmlFor="plannerId">Planner (optional)</label>

            <select
              id="plannerId"
              value={selectedPlannerId}
              onChange={(e) => handlePlannerChange(e.target.value)}
              disabled={loading}
            >
              <option value="">No planner</option>

              {plannerOptions.map((planner) => (
                <option key={planner._id} value={planner._id}>
                  {planner.name}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="category">Category</label>

            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
              required
            >
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

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
            // When editing, wait until the saved transaction has loaded
            disabled={loading || loadingExisting}
          >
            {loading ? "Saving..." : isEditing ? "Save Changes" : "Save Bank Transaction"}
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
