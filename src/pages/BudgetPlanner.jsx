import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Unlock,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Rocket,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";

import {
  formatNGN,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  CATEGORY_ICONS,
} from "../utils/calculations";

// ── Helpers ──

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function monthLabel(key) {
  const [y, m] = key.split("-");
  return `${MONTH_NAMES[Number(m) - 1]} ${y}`;
}

function createEmptyPlan() {
  const income = {};
  INCOME_CATEGORIES.forEach((c) => (income[c] = 0));
  const expense = {};
  EXPENSE_CATEGORIES.forEach((c) => (expense[c] = 0));
  return { locked: false, income, expense, extras: [] };
}

function isPastMonth(key) {
  const now = new Date();
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return key < current;
}

export default function BudgetPlanner({ budgetPlans, setBudgetPlans }) {
  const planKeys = useMemo(() => {
    return Object.keys(budgetPlans).sort();
  }, [budgetPlans]);

  const [activeMonth, setActiveMonth] = useState(() => {
    const now = new Date().toISOString().slice(0, 7);
    return planKeys.includes(now) ? now : planKeys[0] || now;
  });

  // ── Month/Year Picker state ──
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => new Date().getFullYear());

  const plan = budgetPlans[activeMonth] || createEmptyPlan();
  const isLocked = !!plan.locked;
  const isPast = isPastMonth(activeMonth);

  // ── Totals ──
  const totalPlannedIncome = Object.values(plan.income || {}).reduce(
    (s, v) => s + (Number(v) || 0), 0
  );
  const totalPlannedExpense = Object.values(plan.expense || {}).reduce(
    (s, v) => s + (Number(v) || 0), 0
  );
  const extrasIncome = (plan.extras || [])
    .filter((e) => e.type === "income")
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const extrasExpense = (plan.extras || [])
    .filter((e) => e.type === "expense")
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const surplus = totalPlannedIncome + extrasIncome - totalPlannedExpense - extrasExpense;

  // ── Handlers ──
  const updatePlan = (updater) => {
    setBudgetPlans((prev) => ({
      ...prev,
      [activeMonth]: updater(prev[activeMonth] || createEmptyPlan()),
    }));
  };

  const setIncomeCategory = (cat, rawVal) => {
    const num = Number(String(rawVal).replace(/,/g, "")) || 0;
    updatePlan((p) => ({
      ...p,
      income: { ...p.income, [cat]: num },
    }));
  };

  const setExpenseCategory = (cat, rawVal) => {
    const num = Number(String(rawVal).replace(/,/g, "")) || 0;
    updatePlan((p) => ({
      ...p,
      expense: { ...p.expense, [cat]: num },
    }));
  };

  // Accounting format: add commas
  const formatBudgetAmount = (raw) => {
    let cleaned = String(raw).replace(/[^\d.]/g, "");
    cleaned = cleaned.replace(/^0+(\d)/, "$1");
    const parts = cleaned.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
  };

  const displayAmount = (val) => {
    const n = Number(val) || 0;
    return n === 0 ? "" : n.toLocaleString("en-NG");
  };

  const toggleLock = () => {
    updatePlan((p) => ({ ...p, locked: !p.locked }));
  };

  const selectMonthFromPicker = (monthIdx) => {
    const key = `${pickerYear}-${String(monthIdx + 1).padStart(2, "0")}`;
    // Ensure plan exists
    if (!budgetPlans[key]) {
      setBudgetPlans((prev) => ({ ...prev, [key]: createEmptyPlan() }));
    }
    setActiveMonth(key);
    setShowMonthPicker(false);
  };

  // ── Extra-budgetary entry form ──
  const [extraForm, setExtraForm] = useState({
    type: "expense",
    category: "Misc",
    amount: "",
    description: "",
  });

  const addExtra = () => {
    const rawAmt = String(extraForm.amount).replace(/,/g, "");
    const amount = Number(rawAmt);
    if (!amount || amount <= 0) return;
    updatePlan((p) => ({
      ...p,
      extras: [
        ...(p.extras || []),
        {
          id: crypto.randomUUID(),
          type: extraForm.type,
          category: extraForm.category,
          amount,
          description: extraForm.description.trim() || "Extra entry",
        },
      ],
    }));
    setExtraForm((f) => ({ ...f, amount: "", description: "" }));
  };

  const removeExtra = (id) => {
    updatePlan((p) => ({
      ...p,
      extras: (p.extras || []).filter((e) => e.id !== id),
    }));
  };

  // Ensure current month plan is initialized
  React.useEffect(() => {
    if (!budgetPlans[activeMonth]) {
      setBudgetPlans((prev) => ({
        ...prev,
        [activeMonth]: createEmptyPlan(),
      }));
    }
  }, [activeMonth, budgetPlans, setBudgetPlans]);

  const extraCategories =
    extraForm.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const inputsDisabled = isLocked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >


      {/* ── Month Pills + Picker ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 4,
            alignItems: "center",
          }}
          className="hide-scrollbar"
        >
          {planKeys.map((key) => {
            const isActive = key === activeMonth;
            const monthPlan = budgetPlans[key];
            const locked = monthPlan?.locked;
            const past = isPastMonth(key);
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveMonth(key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "10px 16px",
                  borderRadius: "var(--radius-full)",
                  border: isActive
                    ? "2px solid var(--clr-primary)"
                    : "1.5px solid var(--clr-border)",
                  background: isActive
                    ? "rgba(99, 102, 241, 0.1)"
                    : "var(--clr-surface-solid)",
                  color: past && !isActive
                    ? "var(--clr-text-muted)"
                    : isActive
                      ? "var(--clr-primary)"
                      : "var(--clr-text-secondary)",
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  fontFamily: "var(--font-main)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  opacity: past && !isActive ? 0.6 : 1,
                }}
              >
                {locked && <Lock size={12} />}
                {monthLabel(key)}
              </motion.button>
            );
          })}

          {/* Month picker button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowMonthPicker((v) => !v)}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: showMonthPicker
                ? "2px solid var(--clr-primary)"
                : "1.5px dashed var(--clr-border)",
              background: showMonthPicker ? "rgba(99, 102, 241, 0.1)" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              color: showMonthPicker ? "var(--clr-primary)" : "var(--clr-text-muted)",
            }}
            aria-label="Pick month"
          >
            <Calendar size={18} />
          </motion.button>
        </div>

        {/* ── Month/Year Picker Grid ── */}
        <AnimatePresence>
          {showMonthPicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card"
              style={{
                padding: 16,
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
              }}
            >
              {/* Year selector */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 20,
                  marginBottom: 14,
                }}
              >
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setPickerYear((y) => y - 1)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "1.5px solid var(--clr-border)",
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "var(--clr-text-secondary)",
                  }}
                >
                  <ChevronLeft size={16} />
                </motion.button>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--clr-text)",
                    minWidth: 60,
                    textAlign: "center",
                  }}
                >
                  {pickerYear}
                </span>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setPickerYear((y) => y + 1)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "1.5px solid var(--clr-border)",
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "var(--clr-text-secondary)",
                  }}
                >
                  <ChevronRight size={16} />
                </motion.button>
              </div>

              {/* Month grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 8,
                }}
              >
                {MONTH_NAMES.map((name, idx) => {
                  const key = `${pickerYear}-${String(idx + 1).padStart(2, "0")}`;
                  const isActive = key === activeMonth;
                  const past = isPastMonth(key);
                  const hasPlan = !!budgetPlans[key];
                  return (
                    <motion.button
                      key={name}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => selectMonthFromPicker(idx)}
                      style={{
                        padding: "10px 0",
                        borderRadius: "var(--radius-sm)",
                        border: isActive
                          ? "2px solid var(--clr-primary)"
                          : "1.5px solid var(--clr-border)",
                        background: isActive
                          ? "rgba(99, 102, 241, 0.1)"
                          : "var(--clr-surface-solid)",
                        color: past
                          ? "var(--clr-text-muted)"
                          : isActive
                            ? "var(--clr-primary)"
                            : "var(--clr-text)",
                        fontSize: 13,
                        fontWeight: isActive ? 700 : 500,
                        fontFamily: "var(--font-main)",
                        cursor: "pointer",
                        opacity: past ? 0.5 : 1,
                        position: "relative",
                      }}
                    >
                      {name}
                      {hasPlan && (
                        <span
                          style={{
                            position: "absolute",
                            top: 4,
                            right: 6,
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: budgetPlans[key]?.locked
                              ? "var(--clr-warning)"
                              : "var(--clr-success)",
                          }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Lock / Summary Bar ── */}
      <div
        className="glass-card"
        style={{
          padding: 16,
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13 }}>
            <span style={{ color: "var(--clr-success)", fontWeight: 600 }}>
              Income: {formatNGN(totalPlannedIncome + extrasIncome)}
            </span>
            <span style={{ color: "var(--clr-danger)", fontWeight: 600 }}>
              Expense: {formatNGN(totalPlannedExpense + extrasExpense)}
            </span>
            <span
              style={{
                color: surplus >= 0 ? "var(--clr-success)" : "var(--clr-danger)",
                fontWeight: 700,
              }}
            >
              {surplus >= 0 ? "Surplus" : "Deficit"}: {formatNGN(Math.abs(surplus))}
            </span>
          </div>
          {isPast && (
            <span style={{ fontSize: 11, color: "var(--clr-text-muted)", fontStyle: "italic" }}>
              Past month
            </span>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleLock}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: "var(--radius-full)",
            border: "none",
            background: isLocked ? "var(--clr-danger)" : "var(--clr-primary)",
            color: "white",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "var(--font-main)",
            cursor: "pointer",
          }}
        >
          {isLocked ? <Unlock size={14} /> : <Lock size={14} />}
          {isLocked ? "Unlock" : "Lock"}
        </motion.button>
      </div>

      {/* ── Income Planning ── */}
      <div
        className="glass-card"
        style={{ padding: 20, borderRadius: "var(--radius-md)" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <TrendingUp size={18} style={{ color: "var(--clr-success)" }} />
          <span className="section-title" style={{ fontSize: 16, color: "var(--clr-success)" }}>
            Planned Income
          </span>
          <span
            style={{ marginLeft: "auto", fontSize: 14, fontWeight: 700, color: "var(--clr-success)" }}
          >
            {formatNGN(totalPlannedIncome)}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {INCOME_CATEGORIES.map((cat) => (
            <div
              key={cat}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--clr-border)",
                background: "var(--clr-surface-solid)",
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{CATEGORY_ICONS[cat]}</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--clr-text)",
                  flex: 1,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={displayAmount(plan.income?.[cat])}
                onChange={(e) => setIncomeCategory(cat, e.target.value)}
                onFocus={(e) => { if (e.target.value === "0") e.target.value = ""; }}
                disabled={inputsDisabled}
                className="input-field"
                style={{
                  width: 120,
                  fontSize: 13,
                  padding: "6px 10px",
                  minHeight: 36,
                  textAlign: "right",
                  opacity: inputsDisabled ? 0.6 : 1,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Expense Planning ── */}
      <div
        className="glass-card"
        style={{ padding: 20, borderRadius: "var(--radius-md)" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <TrendingDown size={18} style={{ color: "var(--clr-danger)" }} />
          <span className="section-title" style={{ fontSize: 16, color: "var(--clr-danger)" }}>
            Planned Expenses
          </span>
          <span
            style={{ marginLeft: "auto", fontSize: 14, fontWeight: 700, color: "var(--clr-danger)" }}
          >
            {formatNGN(totalPlannedExpense)}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {EXPENSE_CATEGORIES.map((cat) => (
            <div
              key={cat}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--clr-border)",
                background: "var(--clr-surface-solid)",
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{CATEGORY_ICONS[cat]}</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--clr-text)",
                  flex: 1,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={displayAmount(plan.expense?.[cat])}
                onChange={(e) => setExpenseCategory(cat, e.target.value)}
                onFocus={(e) => { if (e.target.value === "0") e.target.value = ""; }}
                disabled={inputsDisabled}
                className="input-field"
                style={{
                  width: 120,
                  fontSize: 13,
                  padding: "6px 10px",
                  minHeight: 36,
                  textAlign: "right",
                  opacity: inputsDisabled ? 0.6 : 1,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Extra-budgetary Entries (only when locked) ── */}
      {isLocked && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="glass-card"
          style={{ padding: 20, borderRadius: "var(--radius-md)" }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}
          >
            <Rocket size={18} style={{ color: "var(--clr-warning)" }} />
            <span className="section-title" style={{ fontSize: 16 }}>
              Extra-budgetary
            </span>
            <span style={{ fontSize: 11, color: "var(--clr-text-muted)", marginLeft: "auto" }}>
              Unplanned income or expenses
            </span>
          </div>

          {/* Existing extras */}
          {(plan.extras || []).length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {plan.extras.map((extra) => (
                <div
                  key={extra.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--clr-border)",
                    background: "var(--clr-surface-solid)",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{CATEGORY_ICONS[extra.category] || "📦"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--clr-text)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {extra.description}
                    </p>
                    <span
                      className={`badge ${extra.type === "income" ? "badge-income" : "badge-expense"}`}
                    >
                      {extra.type}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: extra.type === "income" ? "var(--clr-success)" : "var(--clr-danger)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatNGN(extra.amount)}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => removeExtra(extra.id)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      border: "1px solid var(--clr-border)",
                      background: "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "var(--clr-text-muted)",
                      flexShrink: 0,
                    }}
                  >
                    <Trash2 size={13} />
                  </motion.button>
                </div>
              ))}
            </div>
          )}

          {/* Add extra form */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              padding: 14,
              borderRadius: "var(--radius-sm)",
              border: "1.5px dashed var(--clr-border)",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label className="field-label">Type</label>
                <select
                  value={extraForm.type}
                  onChange={(e) =>
                    setExtraForm((f) => ({
                      ...f,
                      type: e.target.value,
                      category: e.target.value === "income" ? "Other" : "Misc",
                    }))
                  }
                  className="input-field"
                  style={{ fontSize: 13, padding: "8px 10px", minHeight: 36 }}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="field-label">Category</label>
                <select
                  value={extraForm.category}
                  onChange={(e) => setExtraForm((f) => ({ ...f, category: e.target.value }))}
                  className="input-field"
                  style={{ fontSize: 13, padding: "8px 10px", minHeight: 36 }}
                >
                  {extraCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label className="field-label">Amount (₦)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={extraForm.amount}
                  onChange={(e) => setExtraForm((f) => ({ ...f, amount: formatBudgetAmount(e.target.value) }))}
                  placeholder="0"
                  className="input-field"
                  style={{ fontSize: 13, padding: "8px 10px", minHeight: 36 }}
                />
              </div>
              <div>
                <label className="field-label">Description</label>
                <input
                  type="text"
                  value={extraForm.description}
                  onChange={(e) => setExtraForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What's this for?"
                  className="input-field"
                  style={{ fontSize: 13, padding: "8px 10px", minHeight: 36 }}
                />
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={addExtra}
              className="btn-primary"
              style={{ fontSize: 13, padding: "10px 20px", minHeight: 40 }}
            >
              <Plus size={16} />
              Add Entry
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
