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

// The API populates plannerId with { _id, name }; it can also be null (no planner)
const getPlannerId = (transaction) =>
    transaction.plannerId?._id || transaction.plannerId || null;

// "all" + every planner used by these transactions, A-Z.
// includeNone adds a "No planner" option (bank transactions don't need a planner).
export const getPlannerOptions = (transactions, includeNone = false) => {
    const planners = new Map();

    transactions.forEach((transaction) => {
        const id = getPlannerId(transaction);
        if (id) planners.set(String(id), transaction.plannerId?.name || "Unnamed planner");
    });

    const hasNone = transactions.some((transaction) => !getPlannerId(transaction));

    return [
        { value: "all", label: "All planners" },
        ...[...planners]
            .sort((a, b) => a[1].localeCompare(b[1]))
            .map(([value, label]) => ({ value, label })),
        ...(includeNone && hasNone ? [{ value: "none", label: "No planner" }] : [])
    ];
};

export const matchesPlanner = (transaction, planner) => {
    if (planner === "all") return true;

    const id = getPlannerId(transaction);
    return planner === "none" ? !id : String(id) === planner;
};

const getTime = (transaction) =>
    new Date(transaction.date || transaction.createdAt).getTime();

// Returns a new array; the original list is left untouched
export const filterAndSortTransactions = (transactions, { category = "all", planner = "all", sort = "newest" }) =>
    transactions
        .filter((transaction) => category === "all" || transaction.category === category)
        .filter((transaction) => matchesPlanner(transaction, planner))
        .sort((a, b) =>
            sort === "oldest" ? getTime(a) - getTime(b) : getTime(b) - getTime(a)
        );
