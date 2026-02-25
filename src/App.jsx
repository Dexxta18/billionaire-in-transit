import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import BottomNav from "./components/BottomNav";
import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import TaxCalculator from "./pages/TaxCalculator";
import BudgetPlanner from "./pages/BudgetPlanner";
import SettingsPage from "./pages/SettingsPage";

import {
    useLocalStorage,
    seedDemoTransactions,
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
} from "./utils/calculations";

// ── Default budget plan presets (Jan–Mar current year) ──
function createDefaultPlans() {
    const y = new Date().getFullYear();
    const empty = () => {
        const income = {};
        INCOME_CATEGORIES.forEach((c) => (income[c] = 0));
        const expense = {};
        EXPENSE_CATEGORIES.forEach((c) => (expense[c] = 0));
        return { locked: false, income, expense, extras: [] };
    };
    return {
        [`${y}-01`]: empty(),
        [`${y}-02`]: empty(),
        [`${y}-03`]: empty(),
    };
}

export default function App() {
    const [darkMode, setDarkMode] = useLocalStorage("budget-dark", true);
    const [colorTheme, setColorTheme] = useLocalStorage("budget-color-theme", "default");
    const [transactions, setTransactions] = useLocalStorage("budget-transactions", []);
    const [budgetPlans, setBudgetPlans] = useLocalStorage(
        "budget-plans",
        {}
    );
    const [customCategories, setCustomCategories] = useLocalStorage(
        "budget-custom-categories",
        []
    );
    const [activeTab, setActiveTab] = useState("dashboard");
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().toISOString().slice(0, 7)
    );

    const [taxInput, setTaxInput] = useLocalStorage("budget-tax-input", {
        monthlyGross: 0,
        periodMode: "monthly",
        annualGross: 0,
        pensionRate: 0,
        includeNHF: false,
        nhfRate: 2.5,
        nhfBasisMode: "gross",
        annualBasicForNHF: 0,
        annualRentPaid: 0,
    });

    // Boot dark mode
    useEffect(() => {
        const root = document.documentElement;
        if (darkMode) root.classList.add("dark");
        else root.classList.remove("dark");
    }, [darkMode]);

    // Apply color theme
    useEffect(() => {
        const root = document.documentElement;
        // Remove old theme classes
        root.classList.remove("theme-yellow", "theme-blue", "theme-green", "theme-red", "theme-teal");
        if (colorTheme !== "default") {
            root.classList.add(`theme-${colorTheme}`);
        }
    }, [colorTheme]);



    const addTransaction = (payload) => {
        setTransactions((prev) =>
            [payload, ...prev].sort((a, b) => (a.date < b.date ? 1 : -1))
        );
    };

    const deleteTransaction = (id) =>
        setTransactions((prev) => prev.filter((t) => t.id !== id));

    const addCustomCategory = (cat) => {
        setCustomCategories((prev) => [...prev, cat]);
    };

    const deleteCustomCategory = (catName, catType) => {
        setCustomCategories((prev) =>
            prev.filter((c) => !(c.name === catName && c.type === catType))
        );
    };

    const pageVariants = {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
    };

    return (
        <div
            style={{
                minHeight: "100dvh",
                display: "flex",
                flexDirection: "column",
                background: "var(--clr-bg)",
            }}
        >
            {/* Main scrollable content */}
            <main
                style={{
                    flex: 1,
                    padding:
                        "16px 16px calc(var(--bottom-nav-h) + var(--safe-bottom) + 16px)",
                    maxWidth: 600,
                    margin: "0 auto",
                    width: "100%",
                    overflowY: "auto",
                }}
            >
                {/* App Header */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        textAlign: "center",
                        padding: "12px 0 8px",
                        marginBottom: 8,
                    }}
                >
                    <h1
                        style={{
                            fontSize: 20,
                            fontWeight: 800,
                            letterSpacing: "-0.03em",
                            background: "var(--grad-hero)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        Billionaire in Transit
                    </h1>
                    <p
                        style={{
                            fontSize: 11,
                            color: "var(--clr-text-muted)",
                            marginTop: 2,
                        }}
                    >
                        💰 Budget, Tax & Financial Planner
                    </p>
                </motion.div>

                {/* Page Content */}
                <AnimatePresence mode="wait">
                    {activeTab === "dashboard" && (
                        <motion.div
                            key="dashboard"
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.25 }}
                        >
                            <Dashboard
                                transactions={transactions}
                                budgetPlans={budgetPlans}
                                selectedMonth={selectedMonth}
                                setSelectedMonth={setSelectedMonth}
                                deleteTransaction={deleteTransaction}
                            />
                        </motion.div>
                    )}

                    {activeTab === "add" && (
                        <motion.div
                            key="add"
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.25 }}
                        >
                            <AddTransaction
                                onAdd={addTransaction}
                                setSelectedMonth={setSelectedMonth}
                                customCategories={customCategories}
                                onAddCategory={addCustomCategory}
                                onDeleteCategory={deleteCustomCategory}
                                transactions={transactions}
                            />
                        </motion.div>
                    )}

                    {activeTab === "tax" && (
                        <motion.div
                            key="tax"
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.25 }}
                        >
                            <TaxCalculator taxInput={taxInput} setTaxInput={setTaxInput} />
                        </motion.div>
                    )}

                    {activeTab === "budget" && (
                        <motion.div
                            key="budget"
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.25 }}
                        >
                            <BudgetPlanner
                                budgetPlans={budgetPlans}
                                setBudgetPlans={setBudgetPlans}
                                customCategories={customCategories}
                                onAddCategory={addCustomCategory}
                            />
                        </motion.div>
                    )}

                    {activeTab === "settings" && (
                        <motion.div
                            key="settings"
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.25 }}
                        >
                            <SettingsPage
                                transactions={transactions}
                                setTransactions={setTransactions}
                                budgetPlans={budgetPlans}
                                setBudgetPlans={setBudgetPlans}
                                darkMode={darkMode}
                                setDarkMode={setDarkMode}
                                colorTheme={colorTheme}
                                setColorTheme={setColorTheme}
                                customCategories={customCategories}
                                onAddCategory={addCustomCategory}
                                onDeleteCategory={deleteCustomCategory}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Bottom Navigation */}
            <BottomNav active={activeTab} onChange={setActiveTab} />
        </div>
    );
}
