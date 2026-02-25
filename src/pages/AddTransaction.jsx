import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Repeat, Check, Sparkles, PlusCircle, X } from "lucide-react";
import {
    todayISO,
    monthKeyFromDate,
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
    CATEGORY_ICONS,
} from "../utils/calculations";

const QUICK_TEMPLATES = [
    { label: "Salary", type: "income", category: "Salary", description: "Monthly salary", recurring: true },
    { label: "Groceries", type: "expense", category: "Food", description: "Groceries", recurring: false },
    { label: "Transport", type: "expense", category: "Transport", description: "Transport", recurring: false },
    { label: "Utilities", type: "expense", category: "Utilities", description: "Bills", recurring: true },
    { label: "Savings", type: "expense", category: "Savings/Investment", description: "Savings", recurring: true },
];

export default function AddTransaction({ onAdd, setSelectedMonth, customCategories, onAddCategory, onDeleteCategory, transactions }) {
    const [form, setForm] = useState({
        date: todayISO(),
        type: "expense",
        amount: "",
        category: "Food",
        description: "",
        recurring: false,
        notes: "",
    });

    const [showSuccess, setShowSuccess] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    // Merge preset + custom categories
    const baseCategories = form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const extraCats = (customCategories || []).filter((c) => c.type === form.type).map((c) => c.name);
    const categories = [...baseCategories, ...extraCats];

    const handleSubmit = (e) => {
        e.preventDefault();
        const rawAmount = form.amount.replace(/,/g, "");
        const amount = Number(rawAmount);
        if (!amount || amount <= 0) return;
        const payload = {
            id: crypto.randomUUID(),
            date: form.date || todayISO(),
            type: form.type,
            amount: Number(rawAmount),
            category: form.category,
            description:
                form.description.trim() ||
                (form.type === "income" ? "Income" : "Expense"),
            recurring: !!form.recurring,
            notes: form.notes.trim(),
        };
        onAdd(payload);
        setSelectedMonth(monthKeyFromDate(payload.date));

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);

        setForm((f) => ({
            ...f,
            amount: "",
            description: "",
            notes: "",
            date: todayISO(),
        }));
    };

    const quickAdd = (template) => {
        setForm((f) => ({ ...f, ...template, date: todayISO() }));
    };

    const handleAddCategory = () => {
        const name = newCategoryName.trim();
        if (!name) return;
        // check duplicates
        if (categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
            setNewCategoryName("");
            setShowAddCategory(false);
            return;
        }
        onAddCategory({ name, type: form.type });
        setForm((f) => ({ ...f, category: name }));
        setNewCategoryName("");
        setShowAddCategory(false);
    };

    // Accounting format: add commas, strip leading zeros
    const formatAmount = (raw) => {
        // Remove anything that's not a digit or dot
        let cleaned = raw.replace(/[^\d.]/g, "");
        // Remove leading zeros (but keep "0." patterns)
        cleaned = cleaned.replace(/^0+(\d)/, "$1");
        // Separate integer and decimal parts
        const parts = cleaned.split(".");
        // Add commas to integer part
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
    };

    const handleAmountChange = (e) => {
        const formatted = formatAmount(e.target.value);
        setForm((f) => ({ ...f, amount: formatted }));
    };

    // Check if a custom category can be deleted (no transactions)
    const canDeleteCategory = (catName) => {
        return !(transactions || []).some((t) => t.category === catName);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
            <div>
                <h2
                    style={{
                        fontSize: 24,
                        fontWeight: 800,
                        letterSpacing: "-0.03em",
                        color: "var(--clr-text)",
                    }}
                >
                    Add Transaction
                </h2>
                <p style={{ fontSize: 13, color: "var(--clr-text-muted)", marginTop: 2 }}>
                    Record income or expenses
                </p>
            </div>

            {/* ── Quick Templates ── */}
            <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--clr-text-secondary)", marginBottom: 10 }}>
                    <Sparkles size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                    Quick Add
                </p>
                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        overflowX: "auto",
                        paddingBottom: 4,
                    }}
                    className="hide-scrollbar"
                >
                    {QUICK_TEMPLATES.map((tpl) => (
                        <motion.button
                            key={tpl.label}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => quickAdd(tpl)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "10px 16px",
                                borderRadius: "var(--radius-full)",
                                border: "1.5px solid var(--clr-border)",
                                background: "var(--clr-surface-solid)",
                                color: "var(--clr-text)",
                                fontSize: 13,
                                fontWeight: 500,
                                fontFamily: "var(--font-main)",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                            }}
                        >
                            <span>{CATEGORY_ICONS[tpl.category] || "📦"}</span>
                            {tpl.label}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* ── Form ── */}
            <form
                onSubmit={handleSubmit}
                className="glass-card"
                style={{
                    padding: 20,
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                }}
            >
                {/* Type Toggle */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                        background: "var(--clr-surface-solid)",
                        borderRadius: "var(--radius-sm)",
                        padding: 4,
                        border: "1.5px solid var(--clr-border)",
                    }}
                >
                    {["expense", "income"].map((type) => (
                        <motion.button
                            key={type}
                            type="button"
                            onClick={() =>
                                setForm((f) => ({
                                    ...f,
                                    type,
                                    category: type === "income" ? "Salary" : "Food",
                                }))
                            }
                            animate={{
                                background:
                                    form.type === type
                                        ? type === "income"
                                            ? "var(--clr-success)"
                                            : "var(--clr-danger)"
                                        : "transparent",
                                color: form.type === type ? "white" : "var(--clr-text-secondary)",
                            }}
                            style={{
                                padding: "10px 0",
                                borderRadius: 8,
                                border: "none",
                                fontSize: 14,
                                fontWeight: 600,
                                fontFamily: "var(--font-main)",
                                cursor: "pointer",
                                textTransform: "capitalize",
                            }}
                        >
                            {type}
                        </motion.button>
                    ))}
                </div>

                <div>
                    <label className="field-label">Amount (₦)</label>
                    <input
                        type="text"
                        inputMode="decimal"
                        value={form.amount}
                        onChange={handleAmountChange}
                        placeholder="e.g. 25,000"
                        className="input-field"
                        style={{ fontSize: 20, fontWeight: 700, textAlign: "center" }}
                        required
                    />
                </div>

                {/* Category Grid */}
                <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <label className="field-label" style={{ marginBottom: 0 }}>Category</label>
                        <motion.button
                            type="button"
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowAddCategory((v) => !v)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "4px 10px",
                                borderRadius: "var(--radius-full)",
                                border: "1.5px solid var(--clr-border)",
                                background: showAddCategory ? "rgba(99, 102, 241, 0.1)" : "transparent",
                                color: "var(--clr-primary)",
                                fontSize: 11,
                                fontWeight: 600,
                                fontFamily: "var(--font-main)",
                                cursor: "pointer",
                            }}
                        >
                            <PlusCircle size={13} />
                            Add Category
                        </motion.button>
                    </div>

                    {/* Add category input */}
                    <AnimatePresence>
                        {showAddCategory && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{
                                    display: "flex",
                                    gap: 8,
                                    marginBottom: 10,
                                    overflow: "hidden",
                                }}
                            >
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder={`New ${form.type} category name`}
                                    className="input-field"
                                    style={{ flex: 1, fontSize: 13, padding: "8px 12px" }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddCategory();
                                        }
                                    }}
                                />
                                <motion.button
                                    type="button"
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleAddCategory}
                                    style={{
                                        padding: "8px 16px",
                                        borderRadius: "var(--radius-sm)",
                                        border: "none",
                                        background: "var(--clr-primary)",
                                        color: "white",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        fontFamily: "var(--font-main)",
                                        cursor: "pointer",
                                    }}
                                >
                                    Add
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: 8,
                        }}
                    >
                        {categories.map((cat) => {
                            const isActive = form.category === cat;
                            const isCustom = extraCats.includes(cat);
                            const deletable = isCustom && canDeleteCategory(cat);
                            return (
                                <div key={cat} style={{ position: "relative" }}>
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.93 }}
                                        onClick={() => setForm((f) => ({ ...f, category: cat }))}
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: 4,
                                            padding: "10px 4px",
                                            borderRadius: "var(--radius-sm)",
                                            border: isActive
                                                ? "2px solid var(--clr-primary)"
                                                : "1.5px solid var(--clr-border)",
                                            background: isActive
                                                ? "rgba(99, 102, 241, 0.08)"
                                                : "var(--clr-surface-solid)",
                                            cursor: "pointer",
                                            fontFamily: "var(--font-main)",
                                            transition: "all 0.15s",
                                            width: "100%",
                                        }}
                                    >
                                        <span style={{ fontSize: 22 }}>
                                            {CATEGORY_ICONS[cat] || "🏷️"}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: 10,
                                                fontWeight: isActive ? 600 : 400,
                                                color: isActive
                                                    ? "var(--clr-primary)"
                                                    : "var(--clr-text-secondary)",
                                                textAlign: "center",
                                                lineHeight: 1.2,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                width: "100%",
                                            }}
                                        >
                                            {cat}
                                        </span>
                                    </motion.button>
                                    {deletable && (
                                        <motion.button
                                            type="button"
                                            whileTap={{ scale: 0.8 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteCategory(cat, form.type);
                                                if (form.category === cat) {
                                                    setForm((f) => ({ ...f, category: baseCategories[0] }));
                                                }
                                            }}
                                            style={{
                                                position: "absolute",
                                                top: -5,
                                                right: -5,
                                                width: 18,
                                                height: 18,
                                                borderRadius: "50%",
                                                background: "var(--clr-danger)",
                                                color: "white",
                                                border: "none",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer",
                                                zIndex: 2,
                                            }}
                                            title="Delete category"
                                        >
                                            <X size={10} />
                                        </motion.button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Date + Description */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                        <label className="field-label">Date</label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label className="field-label">Description</label>
                        <input
                            type="text"
                            value={form.description}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, description: e.target.value }))
                            }
                            placeholder="What's this for?"
                            className="input-field"
                        />
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="field-label">Notes (optional)</label>
                    <textarea
                        value={form.notes}
                        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                        rows={2}
                        placeholder="Receipt note, vendor, memo..."
                        className="input-field"
                    />
                </div>

                {/* Recurring toggle */}
                <label
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 16px",
                        borderRadius: "var(--radius-sm)",
                        border: "1.5px solid var(--clr-border)",
                        background: "var(--clr-surface-solid)",
                        cursor: "pointer",
                    }}
                >
                    <input
                        type="checkbox"
                        checked={!!form.recurring}
                        onChange={(e) =>
                            setForm((f) => ({ ...f, recurring: e.target.checked }))
                        }
                    />
                    <Repeat size={16} style={{ color: "var(--clr-primary)" }} />
                    <span
                        style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: "var(--clr-text)",
                        }}
                    >
                        Mark as recurring
                    </span>
                </label>

                {/* Submit */}
                <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    className="btn-primary"
                    style={{ width: "100%", fontSize: 16, padding: "14px 24px" }}
                >
                    <Plus size={20} />
                    Add Transaction
                </motion.button>
            </form>

            {/* ── Success Toast ── */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        style={{
                            position: "fixed",
                            bottom: 100,
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "var(--clr-success)",
                            color: "white",
                            padding: "12px 24px",
                            borderRadius: "var(--radius-full)",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontWeight: 600,
                            fontSize: 14,
                            boxShadow: "var(--glow-success)",
                            zIndex: 100,
                        }}
                    >
                        <Check size={18} />
                        Transaction added!
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
