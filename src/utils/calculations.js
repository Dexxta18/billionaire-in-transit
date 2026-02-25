// ── Category & Budget Constants ──

export const EXPENSE_CATEGORIES = [
    "Housing",
    "Food",
    "Transport",
    "Utilities",
    "Health",
    "Education",
    "Entertainment",
    "Family",
    "Savings/Investment",
    "Debt Repayment",
    "Subscriptions",
    "Misc",
];

export const INCOME_CATEGORIES = [
    "Salary",
    "Freelance",
    "Business",
    "Bonus",
    "Interest",
    "Gift",
    "Other",
];

export const DEFAULT_BUDGETS = {
    Housing: 150000,
    Food: 80000,
    Transport: 40000,
    Utilities: 35000,
    Health: 25000,
    Education: 30000,
    Entertainment: 20000,
    Family: 30000,
    "Savings/Investment": 50000,
    "Debt Repayment": 30000,
    Subscriptions: 10000,
    Misc: 25000,
};

// ── Category Icons (emoji shorthand for mobile grid) ──

export const CATEGORY_ICONS = {
    Housing: "🏠",
    Food: "🍔",
    Transport: "🚗",
    Utilities: "💡",
    Health: "🏥",
    Education: "📚",
    Entertainment: "🎬",
    Family: "👨‍👩‍👧",
    "Savings/Investment": "💰",
    "Debt Repayment": "💳",
    Subscriptions: "📱",
    Misc: "📦",
    Salary: "💼",
    Freelance: "💻",
    Business: "🏢",
    Bonus: "🎁",
    Interest: "📈",
    Gift: "🎉",
    Other: "📝",
};

// ── Formatting ──

export const formatNGN = (value) =>
    new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
    }).format(Number.isFinite(value) ? value : 0);

export const todayISO = () => new Date().toISOString().slice(0, 10);
export const monthKeyFromDate = (d) => new Date(d).toISOString().slice(0, 7);
export const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

// ── Tax Calculations ──

function progressiveTax(amount, bands) {
    let remaining = Math.max(0, amount);
    let tax = 0;
    for (const band of bands) {
        if (remaining <= 0) break;
        const slice =
            band.limit === Infinity ? remaining : Math.min(remaining, band.limit);
        tax += slice * band.rate;
        remaining -= slice;
    }
    return tax;
}

export function calculateOldNigeriaPIT({
    annualGross,
    includeNHF,
    nhfRate,
    nhfBasisAmount,
    pensionRate,
}) {
    const gross = Math.max(0, Number(annualGross) || 0);
    const pension = gross * ((Number(pensionRate) || 0) / 100);
    const nhfBase = Math.max(0, Number(nhfBasisAmount) || 0);
    const nhf = includeNHF ? nhfBase * ((Number(nhfRate) || 0) / 100) : 0;

    const adjustedGrossForCRA = Math.max(0, gross - pension - nhf);
    const cra =
        Math.max(200000, 0.01 * adjustedGrossForCRA) +
        0.2 * adjustedGrossForCRA;
    const taxableIncome = Math.max(0, gross - pension - nhf - cra);

    const tax = progressiveTax(taxableIncome, [
        { limit: 300000, rate: 0.07 },
        { limit: 300000, rate: 0.11 },
        { limit: 500000, rate: 0.15 },
        { limit: 500000, rate: 0.19 },
        { limit: 1600000, rate: 0.21 },
        { limit: Infinity, rate: 0.24 },
    ]);

    return {
        gross,
        pension,
        nhf,
        cra,
        taxableIncome,
        tax,
        effectiveRate: gross > 0 ? tax / gross : 0,
        netAnnual: gross - tax,
        netMonthly: (gross - tax) / 12,
        monthlyTax: tax / 12,
    };
}

export function calculateNewNigeriaTaxActPIT({
    annualGross,
    includeNHF,
    nhfRate,
    nhfBasisAmount,
    pensionRate,
    annualRentPaid,
}) {
    const gross = Math.max(0, Number(annualGross) || 0);
    const pension = gross * ((Number(pensionRate) || 0) / 100);
    const nhfBase = Math.max(0, Number(nhfBasisAmount) || 0);
    const nhf = includeNHF ? nhfBase * ((Number(nhfRate) || 0) / 100) : 0;
    const rentPaid = Math.max(0, Number(annualRentPaid) || 0);
    const rentRelief = Math.min(rentPaid * 0.2, 500000);

    const taxableIncome = Math.max(0, gross - pension - nhf - rentRelief);

    const tax = progressiveTax(taxableIncome, [
        { limit: 800000, rate: 0.0 },
        { limit: 2200000, rate: 0.15 },
        { limit: 9000000, rate: 0.18 },
        { limit: 13000000, rate: 0.21 },
        { limit: 25000000, rate: 0.23 },
        { limit: Infinity, rate: 0.25 },
    ]);

    return {
        gross,
        pension,
        nhf,
        rentPaid,
        rentRelief,
        taxableIncome,
        tax,
        effectiveRate: gross > 0 ? tax / gross : 0,
        netAnnual: gross - tax,
        netMonthly: (gross - tax) / 12,
        monthlyTax: tax / 12,
    };
}

// ── Export helpers ──

export function exportTransactionsCSV(transactions) {
    const headers = [
        "id",
        "date",
        "type",
        "amount",
        "category",
        "description",
        "recurring",
        "notes",
    ];
    const rows = transactions.map((t) =>
        headers
            .map((h) => {
                const raw = t[h] ?? "";
                const val = String(raw).replace(/"/g, '""');
                return `"${val}"`;
            })
            .join(",")
    );
    return [headers.join(","), ...rows].join("\n");
}

export function downloadFile(
    name,
    content,
    mime = "text/plain;charset=utf-8"
) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
}

// ── Demo Seed ──

export function seedDemoTransactions() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const base = `${y}-${m}`;
    return [
        { id: crypto.randomUUID(), date: `${base}-01`, type: "income", amount: 850000, category: "Salary", description: "Monthly salary", recurring: true, notes: "" },
        { id: crypto.randomUUID(), date: `${base}-03`, type: "expense", amount: 180000, category: "Housing", description: "Rent contribution", recurring: true, notes: "" },
        { id: crypto.randomUUID(), date: `${base}-05`, type: "expense", amount: 55000, category: "Food", description: "Groceries", recurring: false, notes: "" },
        { id: crypto.randomUUID(), date: `${base}-07`, type: "expense", amount: 25000, category: "Transport", description: "Fuel and ride-hailing", recurring: false, notes: "" },
        { id: crypto.randomUUID(), date: `${base}-10`, type: "income", amount: 120000, category: "Freelance", description: "Design project", recurring: false, notes: "" },
        { id: crypto.randomUUID(), date: `${base}-12`, type: "expense", amount: 18000, category: "Subscriptions", description: "Software tools", recurring: true, notes: "" },
        { id: crypto.randomUUID(), date: `${base}-15`, type: "expense", amount: 32000, category: "Utilities", description: "Power and internet", recurring: true, notes: "" },
        { id: crypto.randomUUID(), date: `${base}-18`, type: "expense", amount: 45000, category: "Savings/Investment", description: "Mutual fund", recurring: true, notes: "" },
        { id: crypto.randomUUID(), date: `${base}-21`, type: "expense", amount: 22000, category: "Entertainment", description: "Outing", recurring: false, notes: "" },
        { id: crypto.randomUUID(), date: `${base}-24`, type: "expense", amount: 30000, category: "Family", description: "Support", recurring: false, notes: "" },
    ];
}

// ── LocalStorage Hook ──

import { useState, useEffect } from "react";

export function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(() => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : initialValue;
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch { /* ignore quota errors */ }
    }, [key, value]);

    return [value, setValue];
}

// ── Chart Palette ──

export const CHART_COLORS = [
    "#6366f1",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#64748b",
    "#a855f7",
    "#0ea5e9",
];

