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

// Case-insensitive text search over the fields a user would remember
export const matchesSearch = (transaction, search) => {
    const query = String(search || "").trim().toLowerCase();
    if (!query) return true;

    return [
        transaction.title,
        transaction.description,
        transaction.category,
        transaction.type,
        transaction.plannerId?.name
    ].some((field) => String(field || "").toLowerCase().includes(query));
};

// Returns a new array; the original list is left untouched
export const filterAndSortTransactions = (transactions, { category = "all", planner = "all", sort = "newest", search = "" }) =>
    transactions
        .filter((transaction) => category === "all" || transaction.category === category)
        .filter((transaction) => matchesSearch(transaction, search))
        .filter((transaction) => matchesPlanner(transaction, planner))
        .sort((a, b) =>
            sort === "oldest" ? getTime(a) - getTime(b) : getTime(b) - getTime(a)
        );

// Default planner filter for a list: the newest planner (latest start date)
// that has at least one of these transactions. "all" when none of them has a planner.
// planners: the user's planners from GET /plan
export const getLatestPlannerId = (transactions, planners) => {
    const usedIds = new Set(
        transactions.map((transaction) => getPlannerId(transaction)).filter(Boolean).map(String)
    );

    const latest = [...planners]
        .filter((planner) => usedIds.has(String(planner._id)))
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];

    return latest ? String(latest._id) : "all";
};
