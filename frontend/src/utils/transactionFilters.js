export const SORT_OPTIONS = [
    { value: "newest", label: "Date (newest)" },
    { value: "oldest", label: "Date (oldest)" }
];

// "all" + every category the user actually has, A-Z
export const getCategoryOptions = (transactions) => [
    { value: "all", label: "All categories" },
    ...[...new Set(transactions.map((transaction) => transaction.category).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b))
        .map((category) => ({ value: category, label: category }))
];

const getTime = (transaction) =>
    new Date(transaction.date || transaction.createdAt).getTime();

// Returns a new array; the original list is left untouched
export const filterAndSortTransactions = (transactions, category, sort) =>
    transactions
        .filter((transaction) => category === "all" || transaction.category === category)
        .sort((a, b) =>
            sort === "oldest" ? getTime(a) - getTime(b) : getTime(b) - getTime(a)
        );
