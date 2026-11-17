// Download rows as a CSV file the user can open in Excel / Google Sheets.
// columns: [{ label, value: (row) => any }]

const escapeCell = (value) => {
    const text = value === undefined || value === null ? "" : String(value);
    // Stop spreadsheet apps from running cell text as a formula (CSV injection)
    const safe = /^[=+\-@\t\r]/.test(text) && Number.isNaN(Number(text)) ? `'${text}` : text;
    return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export const exportCsv = (filename, columns, rows) => {
    const lines = [
        columns.map((column) => escapeCell(column.label)).join(","),
        ...rows.map((row) => columns.map((column) => escapeCell(column.value(row))).join(","))
    ];

    // The BOM makes Excel read the file as UTF-8 (keeps "Rs." and any non-English text intact)
    const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

// "transactions-2026-11-17.csv"
export const datedFilename = (name) =>
    `${name}-${new Date().toISOString().split("T")[0]}.csv`;

// Plain YYYY-MM-DD so spreadsheets sort the column correctly
export const csvDate = (value) =>
    value ? new Date(value).toISOString().split("T")[0] : "";
