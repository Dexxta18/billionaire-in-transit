import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
} from "recharts";
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Target,
    Search,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import MetricCard from "../components/MetricCard";
import TransactionItem from "../components/TransactionItem";
import {
    formatNGN,
    monthKeyFromDate,
    CATEGORY_ICONS,
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
    CHART_COLORS,
} from "../utils/calculations";

const MONTH_LABELS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

function prettyMonth(key) {
    const [y, m] = key.split("-");
    return `${MONTH_LABELS[Number(m) - 1]} ${y}`;
}

function shiftMonth(key, delta) {
    const [y, m] = key.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/* ─── helpers to build top-4 + Others pie ─── */
function buildTop4Pie(actualByCat) {
    const entries = Object.entries(actualByCat)
        .filter(([, v]) => v > 0)
        .sort(([, a], [, b]) => b - a);

    if (entries.length <= 5) {
        return entries.map(([name, value]) => ({ name, value }));
    }

    const top4 = entries.slice(0, 4);
    const others = entries.slice(4).reduce((s, [, v]) => s + v, 0);
    return [
        ...top4.map(([name, value]) => ({ name, value })),
        { name: "Others", value: others },
    ];
}

/* ─── helper: get months in a quarter ─── */
function quarterMonths(month) {
    const [y, m] = month.split("-").map(Number);
    const q = Math.floor((m - 1) / 3);
    return [0, 1, 2].map((i) => {
        const mm = q * 3 + 1 + i;
        return `${y}-${String(mm).padStart(2, "0")}`;
    });
}

/* ─── helper: get months YTD (Jan to current month) ─── */
function ytdMonths(month) {
    const [y] = month.split("-").map(Number);
    const now = new Date();
    const maxMonth = y === now.getFullYear() ? now.getMonth() + 1 : 12;
    const months = [];
    for (let m = 1; m <= maxMonth; m++) {
        months.push(`${y}-${String(m).padStart(2, "0")}`);
    }
    return months;
}

/* ─── helper: get all 12 months of a year ─── */
function yearlyMonths(month) {
    const [y] = month.split("-").map(Number);
    const months = [];
    for (let m = 1; m <= 12; m++) {
        months.push(`${y}-${String(m).padStart(2, "0")}`);
    }
    return months;
}

export default function Dashboard({
    transactions,
    budgetPlans,
    selectedMonth,
    setSelectedMonth,
    deleteTransaction,
}) {
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [viewMode, setViewMode] = useState("monthly"); // "monthly" | "quarterly" | "ytd" | "yearly"

    const plan = budgetPlans?.[selectedMonth];

    // ── Determine which months are in scope ──
    const scopeMonths = useMemo(() => {
        if (viewMode === "quarterly") return quarterMonths(selectedMonth);
        if (viewMode === "ytd") return ytdMonths(selectedMonth);
        if (viewMode === "yearly") return yearlyMonths(selectedMonth);
        return [selectedMonth];
    }, [viewMode, selectedMonth]);

    // Today's ISO date for YTD filtering
    const todayISO = new Date().toISOString().slice(0, 10);

    // ── Aggregate transactions across scope ──
    const scopeTransactions = useMemo(
        () => {
            let filtered = transactions.filter((t) => scopeMonths.includes(monthKeyFromDate(t.date)));
            // For YTD, only include transactions up to today
            if (viewMode === "ytd") {
                filtered = filtered.filter((t) => t.date <= todayISO);
            }
            return filtered;
        },
        [transactions, scopeMonths, viewMode, todayISO]
    );

    // ── Month transactions (always single month for list) ──
    const monthTransactions = useMemo(
        () => transactions.filter((t) => monthKeyFromDate(t.date) === selectedMonth),
        [transactions, selectedMonth]
    );

    // ── Actual totals by category (scope) ──
    const actualIncomeByCat = useMemo(() => {
        const map = {};
        INCOME_CATEGORIES.forEach((c) => (map[c] = 0));
        scopeTransactions
            .filter((t) => t.type === "income")
            .forEach((t) => (map[t.category] = (map[t.category] || 0) + Number(t.amount)));
        return map;
    }, [scopeTransactions]);

    const actualExpenseByCat = useMemo(() => {
        const map = {};
        EXPENSE_CATEGORIES.forEach((c) => (map[c] = 0));
        scopeTransactions
            .filter((t) => t.type === "expense")
            .forEach((t) => (map[t.category] = (map[t.category] || 0) + Number(t.amount)));
        return map;
    }, [scopeTransactions]);

    const totalActualIncome = Object.values(actualIncomeByCat).reduce((s, v) => s + v, 0);
    const totalActualExpense = Object.values(actualExpenseByCat).reduce((s, v) => s + v, 0);

    // ── Planned totals (aggregate across scope) ──
    const { totalPlannedIncome, totalPlannedExpense, plannedIncomeByCat, plannedExpenseByCat } = useMemo(() => {
        const incCat = {};
        INCOME_CATEGORIES.forEach((c) => (incCat[c] = 0));
        const expCat = {};
        EXPENSE_CATEGORIES.forEach((c) => (expCat[c] = 0));
        let pInc = 0;
        let pExp = 0;

        scopeMonths.forEach((mk) => {
            const p = budgetPlans?.[mk];
            if (!p) return;
            Object.entries(p.income || {}).forEach(([c, v]) => {
                const n = Number(v) || 0;
                pInc += n;
                incCat[c] = (incCat[c] || 0) + n;
            });
            Object.entries(p.expense || {}).forEach(([c, v]) => {
                const n = Number(v) || 0;
                pExp += n;
                expCat[c] = (expCat[c] || 0) + n;
            });
            (p.extras || []).forEach((e) => {
                const n = Number(e.amount) || 0;
                if (e.type === "income") pInc += n;
                else pExp += n;
            });
        });

        return {
            totalPlannedIncome: pInc,
            totalPlannedExpense: pExp,
            plannedIncomeByCat: incCat,
            plannedExpenseByCat: expCat,
        };
    }, [scopeMonths, budgetPlans]);

    const netActual = totalActualIncome - totalActualExpense;

    // ── Budget vs Actual data for bar chart ──
    const budgetVsActualExpense = useMemo(
        () =>
            EXPENSE_CATEGORIES.filter(
                (cat) => (plannedExpenseByCat[cat] || 0) > 0 || (actualExpenseByCat[cat] || 0) > 0
            ).map((cat) => ({
                name: cat,
                Planned: plannedExpenseByCat[cat] || 0,
                Actual: actualExpenseByCat[cat] || 0,
            })),
        [plannedExpenseByCat, actualExpenseByCat]
    );

    // ── Pie chart data — top-4 + Others ──
    const categoryExpenseData = useMemo(() => buildTop4Pie(actualExpenseByCat), [actualExpenseByCat]);

    // ── Filtered transactions (single month for list) ──
    const filteredTransactions = useMemo(() => {
        let list = monthTransactions;
        if (filterType !== "all") list = list.filter((t) => t.type === filterType);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (t) =>
                    (t.description || "").toLowerCase().includes(q) ||
                    (t.category || "").toLowerCase().includes(q)
            );
        }
        return list;
    }, [monthTransactions, filterType, search]);

    const hasPlan = scopeMonths.some((m) => !!budgetPlans?.[m]);

    // ── View mode label ──
    const viewLabel = useMemo(() => {
        if (viewMode === "quarterly") {
            const [y, m] = selectedMonth.split("-").map(Number);
            const q = Math.floor((m - 1) / 3) + 1;
            return `Q${q} ${y}`;
        }
        if (viewMode === "ytd") {
            const [y] = selectedMonth.split("-");
            return `YTD ${y}`;
        }
        if (viewMode === "yearly") {
            const [y] = selectedMonth.split("-");
            return `Year ${y}`;
        }
        return prettyMonth(selectedMonth);
    }, [viewMode, selectedMonth]);

    // ── Variance row for EXPENSES (over = red) ──
    const ExpenseVarianceRow = ({ cat, planned, actual }) => {
        const variance = planned - actual;
        const pct = planned > 0 ? Math.min((actual / planned) * 100, 150) : actual > 0 ? 100 : 0;
        const over = actual > planned && planned > 0;
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 0",
                    borderBottom: "1px solid var(--clr-border)",
                }}
            >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{CATEGORY_ICONS[cat]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 12,
                            marginBottom: 4,
                        }}
                    >
                        <span
                            style={{
                                fontWeight: 500,
                                color: "var(--clr-text)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {cat}
                        </span>
                        <span
                            style={{
                                fontWeight: 600,
                                color: over ? "var(--clr-danger)" : "var(--clr-success)",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {over ? "+" : ""}
                            {formatNGN(Math.abs(variance))}
                        </span>
                    </div>
                    <div
                        style={{
                            height: 5,
                            borderRadius: 3,
                            background: "var(--clr-border)",
                            overflow: "hidden",
                        }}
                    >
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(pct, 100)}%` }}
                            transition={{ duration: 0.5 }}
                            style={{
                                height: "100%",
                                borderRadius: 3,
                                background: over ? "var(--clr-danger)" : "var(--clr-primary)",
                            }}
                        />
                    </div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 10,
                            color: "var(--clr-text-muted)",
                            marginTop: 3,
                        }}
                    >
                        <span>{formatNGN(actual)} actual</span>
                        <span>{formatNGN(planned)} planned</span>
                    </div>
                </div>
            </div>
        );
    };

    // ── Variance row for INCOME (under = red, over = green) ──
    const IncomeVarianceRow = ({ cat, planned, actual }) => {
        const variance = actual - planned;
        const pct = planned > 0 ? Math.min((actual / planned) * 100, 150) : actual > 0 ? 100 : 0;
        const under = actual < planned && planned > 0;
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 0",
                    borderBottom: "1px solid var(--clr-border)",
                }}
            >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{CATEGORY_ICONS[cat]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 12,
                            marginBottom: 4,
                        }}
                    >
                        <span
                            style={{
                                fontWeight: 500,
                                color: "var(--clr-text)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {cat}
                        </span>
                        <span
                            style={{
                                fontWeight: 600,
                                color: under ? "var(--clr-danger)" : "var(--clr-success)",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {variance >= 0 ? "+" : ""}
                            {formatNGN(Math.abs(variance))}
                        </span>
                    </div>
                    <div
                        style={{
                            height: 5,
                            borderRadius: 3,
                            background: "var(--clr-border)",
                            overflow: "hidden",
                        }}
                    >
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(pct, 100)}%` }}
                            transition={{ duration: 0.5 }}
                            style={{
                                height: "100%",
                                borderRadius: 3,
                                background: under ? "var(--clr-danger)" : "var(--clr-success)",
                            }}
                        />
                    </div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 10,
                            color: "var(--clr-text-muted)",
                            marginTop: 3,
                        }}
                    >
                        <span>{formatNGN(actual)} actual</span>
                        <span>{formatNGN(planned)} planned</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
            {/* ── Month Picker ── */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                }}
            >
                <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setSelectedMonth(shiftMonth(selectedMonth, -1))}
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        border: "1.5px solid var(--clr-border)",
                        background: "var(--clr-surface-solid)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "var(--clr-text-secondary)",
                    }}
                >
                    <ChevronLeft size={18} />
                </motion.button>
                <h2
                    style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "var(--clr-text)",
                        minWidth: 180,
                        textAlign: "center",
                    }}
                >
                    {viewLabel}
                </h2>
                <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setSelectedMonth(shiftMonth(selectedMonth, 1))}
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        border: "1.5px solid var(--clr-border)",
                        background: "var(--clr-surface-solid)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "var(--clr-text-secondary)",
                    }}
                >
                    <ChevronRight size={18} />
                </motion.button>
            </div>

            {/* ── View Mode Toggle (Monthly / Quarterly / YTD) ── */}
            <div
                style={{
                    display: "flex",
                    gap: 0,
                    background: "var(--clr-surface-solid)",
                    borderRadius: "var(--radius-full)",
                    padding: 3,
                    border: "1.5px solid var(--clr-border)",
                }}
            >
                {[
                    { id: "monthly", label: "Monthly" },
                    { id: "quarterly", label: "Quarterly" },
                    { id: "ytd", label: "YTD" },
                    { id: "yearly", label: "Yearly" },
                ].map((mode) => (
                    <motion.button
                        key={mode.id}
                        onClick={() => setViewMode(mode.id)}
                        animate={{
                            background: viewMode === mode.id ? "var(--clr-primary)" : "transparent",
                            color: viewMode === mode.id ? "white" : "var(--clr-text-secondary)",
                        }}
                        style={{
                            flex: 1,
                            padding: "8px 0",
                            borderRadius: "var(--radius-full)",
                            border: "none",
                            fontSize: 13,
                            fontWeight: viewMode === mode.id ? 700 : 500,
                            fontFamily: "var(--font-main)",
                            cursor: "pointer",
                        }}
                    >
                        {mode.label}
                    </motion.button>
                ))}
            </div>

            {/* ── Summary Cards ── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 12,
                }}
            >
                <MetricCard
                    title="Planned Income"
                    value={formatNGN(totalPlannedIncome)}
                    icon={Target}
                    gradient="grad-net"
                    hint={hasPlan ? "Budget target" : "No plan set"}
                    delay={0}
                />
                <MetricCard
                    title="Actual Income"
                    value={formatNGN(totalActualIncome)}
                    icon={TrendingUp}
                    gradient="grad-income"
                    hint={
                        totalPlannedIncome > 0
                            ? `${((totalActualIncome / totalPlannedIncome) * 100).toFixed(0)}% of plan`
                            : "—"
                    }
                    delay={0.05}
                />
                <MetricCard
                    title="Planned Expense"
                    value={formatNGN(totalPlannedExpense)}
                    icon={Target}
                    hint={hasPlan ? "Budget target" : "No plan set"}
                    delay={0.1}
                />
                <MetricCard
                    title="Actual Expense"
                    value={formatNGN(totalActualExpense)}
                    icon={TrendingDown}
                    gradient="grad-expense"
                    hint={
                        totalPlannedExpense > 0
                            ? `${((totalActualExpense / totalPlannedExpense) * 100).toFixed(0)}% of plan`
                            : "—"
                    }
                    delay={0.15}
                />
            </div>

            {/* Net flow bar */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    background: netActual >= 0
                        ? "rgba(16, 185, 129, 0.08)"
                        : "rgba(239, 68, 68, 0.08)",
                    border: `1.5px solid ${netActual >= 0
                        ? "rgba(16, 185, 129, 0.2)"
                        : "rgba(239, 68, 68, 0.2)"
                        }`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 14,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Wallet size={18} style={{ color: netActual >= 0 ? "var(--clr-success)" : "var(--clr-danger)" }} />
                    <span style={{ fontWeight: 600, color: "var(--clr-text)" }}>
                        Net Cash Flow
                    </span>
                </div>
                <span
                    style={{
                        fontWeight: 800,
                        fontSize: 16,
                        color: netActual >= 0 ? "var(--clr-success)" : "var(--clr-danger)",
                    }}
                >
                    {formatNGN(netActual)}
                </span>
            </motion.div>

            {/* ── Expense Breakdown Pie (top 4 + Others) ── */}
            {categoryExpenseData.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="glass-card"
                    style={{ padding: 18, borderRadius: "var(--radius-md)" }}
                >
                    <p className="section-title" style={{ fontSize: 15, marginBottom: 12 }}>
                        Expense Breakdown
                    </p>
                    <div style={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryExpenseData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={60}
                                    outerRadius={95}
                                    paddingAngle={3}
                                    strokeWidth={0}
                                >
                                    {categoryExpenseData.map((_, idx) => (
                                        <Cell
                                            key={idx}
                                            fill={CHART_COLORS[idx % CHART_COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => formatNGN(Number(value))}
                                    contentStyle={{
                                        borderRadius: 12,
                                        border: "1px solid var(--clr-border)",
                                        background: "var(--clr-surface-solid)",
                                        color: "var(--clr-text)",
                                    }}
                                />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            )}

            {/* ── Budget vs Actual — Income ── */}
            {hasPlan && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="glass-card"
                    style={{ padding: 18, borderRadius: "var(--radius-md)" }}
                >
                    <p className="section-title" style={{ fontSize: 15, marginBottom: 12 }}>
                        Income: Budget vs Actual
                    </p>
                    {INCOME_CATEGORIES.filter(
                        (cat) =>
                            (plannedIncomeByCat[cat] || 0) > 0 || (actualIncomeByCat[cat] || 0) > 0
                    ).map((cat) => (
                        <IncomeVarianceRow
                            key={cat}
                            cat={cat}
                            planned={plannedIncomeByCat[cat] || 0}
                            actual={actualIncomeByCat[cat] || 0}
                        />
                    ))}
                    {INCOME_CATEGORIES.filter(
                        (cat) =>
                            (plannedIncomeByCat[cat] || 0) > 0 || (actualIncomeByCat[cat] || 0) > 0
                    ).length === 0 && (
                            <p style={{ fontSize: 13, color: "var(--clr-text-muted)", textAlign: "center", padding: 20 }}>
                                No income planned or recorded
                            </p>
                        )}
                </motion.div>
            )}

            {/* ── Budget vs Actual — Expense ── */}
            {hasPlan && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card"
                    style={{ padding: 18, borderRadius: "var(--radius-md)" }}
                >
                    <p className="section-title" style={{ fontSize: 15, marginBottom: 12 }}>
                        Expenses: Budget vs Actual
                    </p>
                    {budgetVsActualExpense.map((item) => (
                        <ExpenseVarianceRow
                            key={item.name}
                            cat={item.name}
                            planned={item.Planned}
                            actual={item.Actual}
                        />
                    ))}
                    {budgetVsActualExpense.length === 0 && (
                        <p style={{ fontSize: 13, color: "var(--clr-text-muted)", textAlign: "center", padding: 20 }}>
                            No expenses planned or recorded
                        </p>
                    )}
                </motion.div>
            )}



            {/* ── Transaction List ── */}
            <div>
                <p className="section-title" style={{ fontSize: 15, marginBottom: 12 }}>
                    Transactions
                </p>

                {/* Search + Filter */}
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "0 12px",
                            borderRadius: "var(--radius-full)",
                            border: "1.5px solid var(--clr-border)",
                            background: "var(--clr-surface-solid)",
                        }}
                    >
                        <Search size={16} style={{ color: "var(--clr-text-muted)" }} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                border: "none",
                                outline: "none",
                                background: "transparent",
                                flex: 1,
                                fontSize: 13,
                                padding: "10px 0",
                                color: "var(--clr-text)",
                                fontFamily: "var(--font-main)",
                            }}
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="input-field"
                        style={{
                            width: 100,
                            fontSize: 12,
                            borderRadius: "var(--radius-full)",
                            padding: "8px 12px",
                        }}
                    >
                        <option value="all">All</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </div>

                {/* List */}
                {filteredTransactions.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: 40,
                            color: "var(--clr-text-muted)",
                            fontSize: 13,
                        }}
                    >
                        No transactions for this month
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {filteredTransactions.map((t) => (
                            <TransactionItem
                                key={t.id}
                                transaction={t}
                                onDelete={deleteTransaction}
                            />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
