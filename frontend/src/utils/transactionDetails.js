export const formatCurrency = (value) =>
    `Rs. ${Number(value || 0).toLocaleString()}`;

export const formatFullDate = (value) =>
    value
        ? new Date(value).toLocaleDateString("en-GB", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric"
        })
        : "";

export const formatDateTime = (value) =>
    value
        ? new Date(value).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
        : "";

// Only show "Last edited" when the transaction was actually changed after it was added
export const getEditedAt = (transaction) =>
    transaction.updatedAt &&
    new Date(transaction.updatedAt).getTime() - new Date(transaction.createdAt).getTime() > 1000
        ? formatDateTime(transaction.updatedAt)
        : "";

// Props for <TransactionDetailsModal> for a normal income/expense transaction
export const getTransactionDetails = (transaction) => {
    const isIncome = transaction.type === "income";

    return {
        eyebrow: isIncome ? "INCOME" : "EXPENSE",
        title: transaction.title,
        amount: `${isIncome ? "+" : "-"}${formatCurrency(transaction.amount)}`,
        amountClass: isIncome ? "income" : "expense",
        rows: [
            { label: "Type", value: isIncome ? "Income" : "Expense" },
            { label: "Category", value: transaction.category },
            { label: "Date", value: formatFullDate(transaction.date) },
            // plannerId is populated with the planner's name by the API
            { label: "Planner", value: transaction.plannerId?.name },
            { label: "Description", value: transaction.description },
            { label: "Added on", value: formatDateTime(transaction.createdAt) },
            { label: "Last edited", value: getEditedAt(transaction) }
        ]
    };
};
