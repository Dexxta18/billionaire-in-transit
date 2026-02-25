import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Moon,
    Sun,
    Download,
    Upload,
    FileDown,
    RotateCcw,
    Trash2,
    Shield,
    Palette,
    Users,
    Coffee,
    ChevronDown,
    ChevronUp,
    Heart,
} from "lucide-react";

import {
    exportTransactionsCSV,
    downloadFile,
    seedDemoTransactions,
} from "../utils/calculations";

/* ── Theme definitions ── */
const COLOR_THEMES = [
    { id: "default", label: "Indigo", color: "#6366f1", emoji: "💜" },
    { id: "yellow", label: "Yellow", color: "#f59e0b", emoji: "💛" },
    { id: "blue", label: "Ocean", color: "#2563eb", emoji: "💙" },
    { id: "green", label: "Forest", color: "#059669", emoji: "💚" },
    { id: "red", label: "Crimson", color: "#dc2626", emoji: "❤️" },
    { id: "teal", label: "Teal", color: "#0d9488", emoji: "🩵" },
];

/* ── Team members ── */
const TEAM_MEMBERS = [
    {
        name: "Damilola Quadri",
        role: "Creative Director",
        initials: "DQ",
        photo: "/team/damilola.jpg",
        gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        featured: true,
    },
    {
        name: "Wuraola Durowoju",
        role: "Creative Director",
        initials: "WD",
        photo: "/team/wuraola.jpg",
        gradient: "linear-gradient(135deg, #f59e0b, #f97316)",
        featured: true,
    },
    {
        name: "Ayomide Taiwo",
        role: "Contributor",
        initials: "AT",
        photo: "/team/ayomide.jpg",
        gradient: "linear-gradient(135deg, #10b981, #06b6d4)",
        featured: false,
    },
    {
        name: "Oluwasesan Oyewusi",
        role: "Contributor",
        initials: "OO",
        photo: "/team/oluwasesan.jpg",
        gradient: "linear-gradient(135deg, #ec4899, #f43f5e)",
        featured: false,
    },
    {
        name: "Olawunmi Erinosho",
        role: "Strategic Input",
        initials: "OE",
        photo: "/team/olawunmi.jpg",
        gradient: "linear-gradient(135deg, #0ea5e9, #2563eb)",
        featured: false,
    },
    {
        name: "Kolapo Olaleye",
        role: "Strategic Input",
        initials: "KO",
        photo: "/team/kolapo.jpg",
        gradient: "linear-gradient(135deg, #14b8a6, #059669)",
        featured: false,
    },
];

/* ── Avatar component ── */
const TeamAvatar = ({ member, size }) => {
    const [imgError, setImgError] = React.useState(false);

    const containerStyle = {
        width: size,
        height: size,
        borderRadius: "50%",
        background: member.gradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 800,
        color: "white",
        letterSpacing: "-0.02em",
        boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
        border: "3px solid var(--clr-surface-solid)",
        flexShrink: 0,
        overflow: "hidden",
    };

    return (
        <div style={containerStyle}>
            {member.photo && !imgError ? (
                <img
                    src={member.photo}
                    alt={member.name}
                    onError={() => setImgError(true)}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                />
            ) : (
                member.initials
            )}
        </div>
    );
};

/* ── Role badge ── */
const RoleBadge = ({ role }) => {
    const colors = {
        "Creative Director": { bg: "rgba(99,102,241,0.12)", text: "#6366f1" },
        Contributor: { bg: "rgba(16,185,129,0.12)", text: "#10b981" },
        "Strategic Input": { bg: "rgba(14,165,233,0.12)", text: "#0ea5e9" },
    };
    const c = colors[role] || colors.Contributor;
    return (
        <span
            style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: 20,
                background: c.bg,
                color: c.text,
                whiteSpace: "nowrap",
            }}
        >
            {role}
        </span>
    );
};

export default function SettingsPage({
    transactions,
    setTransactions,
    budgetPlans,
    setBudgetPlans,
    darkMode,
    setDarkMode,
    colorTheme,
    setColorTheme,
}) {
    const [showAbout, setShowAbout] = useState(false);

    const handleExportJSON = () => {
        const payload = {
            transactions,
            budgetPlans,
            exportedAt: new Date().toISOString(),
        };
        downloadFile(
            `planning-data-${new Date().toISOString().slice(0, 10)}.json`,
            JSON.stringify(payload, null, 2),
            "application/json;charset=utf-8"
        );
    };

    const handleImportJSON = async (file) => {
        if (!file) return;
        const text = await file.text();
        try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed.transactions))
                setTransactions(parsed.transactions);
            if (parsed.budgetPlans && typeof parsed.budgetPlans === "object")
                setBudgetPlans((b) => ({ ...b, ...parsed.budgetPlans }));
        } catch {
            alert("Could not import file. Please upload a valid JSON export.");
        }
    };

    const handleExportCSV = () => {
        const csv = exportTransactionsCSV(transactions);
        downloadFile(
            `transactions-${new Date().toISOString().slice(0, 10)}.csv`,
            csv,
            "text/csv;charset=utf-8"
        );
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
                    Settings
                </h2>
                <p style={{ fontSize: 13, color: "var(--clr-text-muted)", marginTop: 2 }}>
                    Preferences & data management
                </p>
            </div>

            {/* ── Dark / Light Toggle ── */}
            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setDarkMode((v) => !v)}
                className="glass-card"
                style={{
                    padding: "16px 20px",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    cursor: "pointer",
                    border: "1.5px solid var(--clr-border)",
                    background: "var(--clr-surface-solid)",
                    fontFamily: "var(--font-main)",
                    width: "100%",
                    textAlign: "left",
                }}
            >
                <div
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: darkMode
                            ? "rgba(99, 102, 241, 0.12)"
                            : "rgba(245, 158, 11, 0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {darkMode ? (
                        <Moon size={20} style={{ color: "var(--clr-primary)" }} />
                    ) : (
                        <Sun size={20} style={{ color: "var(--clr-warning)" }} />
                    )}
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--clr-text)" }}>
                        {darkMode ? "Dark Mode" : "Light Mode"}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--clr-text-muted)" }}>
                        Tap to switch to {darkMode ? "light" : "dark"} mode
                    </p>
                </div>
                <div
                    style={{
                        width: 48,
                        height: 28,
                        borderRadius: 14,
                        background: darkMode ? "var(--clr-primary)" : "#cbd5e1",
                        position: "relative",
                        transition: "background 0.3s",
                    }}
                >
                    <motion.div
                        animate={{ x: darkMode ? 22 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            background: "white",
                            position: "absolute",
                            top: 2,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                    />
                </div>
            </motion.button>

            {/* ── Color Theme Picker ── */}
            <div
                className="glass-card"
                style={{ padding: 20, borderRadius: "var(--radius-md)" }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <Palette size={18} style={{ color: "var(--clr-primary)" }} />
                    <span className="section-title" style={{ fontSize: 16 }}>
                        Color Theme
                    </span>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 10,
                    }}
                >
                    {COLOR_THEMES.map((theme) => (
                        <motion.button
                            key={theme.id}
                            whileTap={{ scale: 0.93 }}
                            onClick={() => setColorTheme(theme.id)}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 6,
                                padding: "14px 8px",
                                borderRadius: 14,
                                border: colorTheme === theme.id
                                    ? `2.5px solid ${theme.color}`
                                    : "1.5px solid var(--clr-border)",
                                background: colorTheme === theme.id
                                    ? `${theme.color}11`
                                    : "var(--clr-surface-solid)",
                                cursor: "pointer",
                                fontFamily: "var(--font-main)",
                                transition: "all 0.2s",
                            }}
                        >
                            <div
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    background: theme.color,
                                    boxShadow: colorTheme === theme.id
                                        ? `0 0 12px ${theme.color}44`
                                        : "none",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 14,
                                }}
                            >
                                {colorTheme === theme.id ? "✓" : ""}
                            </div>
                            <span
                                style={{
                                    fontSize: 11,
                                    fontWeight: colorTheme === theme.id ? 700 : 500,
                                    color: colorTheme === theme.id
                                        ? theme.color
                                        : "var(--clr-text-secondary)",
                                }}
                            >
                                {theme.label}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* ── Data & Export ── */}
            <div
                className="glass-card"
                style={{ padding: 20, borderRadius: "var(--radius-md)" }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <Shield size={18} style={{ color: "var(--clr-primary)" }} />
                    <span className="section-title" style={{ fontSize: 16 }}>
                        Data & Export
                    </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleExportCSV}
                        className="btn-outline"
                        style={{ width: "100%", justifyContent: "flex-start" }}
                    >
                        <FileDown size={18} />
                        Export Transactions CSV
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleExportJSON}
                        className="btn-outline"
                        style={{ width: "100%", justifyContent: "flex-start" }}
                    >
                        <Download size={18} />
                        Export All Data (JSON)
                    </motion.button>

                    <label
                        className="btn-outline"
                        style={{ width: "100%", justifyContent: "flex-start", cursor: "pointer" }}
                    >
                        <Upload size={18} />
                        Import Data (JSON)
                        <input
                            type="file"
                            accept="application/json"
                            style={{ display: "none" }}
                            onChange={(e) => handleImportJSON(e.target.files?.[0])}
                        />
                    </label>
                </div>
            </div>

            {/* ── Demo & Reset ── */}
            <div
                className="glass-card"
                style={{ padding: 20, borderRadius: "var(--radius-md)" }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <RotateCcw size={18} style={{ color: "var(--clr-text-muted)" }} />
                    <span className="section-title" style={{ fontSize: 16 }}>
                        Demo & Reset
                    </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setTransactions(seedDemoTransactions())}
                        className="btn-outline"
                        style={{ width: "100%" }}
                    >
                        Load demo transactions
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                            if (confirm("Clear all transactions? This cannot be undone."))
                                setTransactions([]);
                        }}
                        className="btn-danger-outline"
                        style={{ width: "100%" }}
                    >
                        <Trash2 size={16} />
                        Clear all transactions
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                            if (confirm("Reset all budget plans? This cannot be undone."))
                                setBudgetPlans({});
                        }}
                        className="btn-danger-outline"
                        style={{ width: "100%" }}
                    >
                        <Trash2 size={16} />
                        Reset all budget plans
                    </motion.button>
                </div>
            </div>

            {/* ── About Section ── */}
            <motion.div
                className="glass-card"
                style={{ padding: 20, borderRadius: "var(--radius-md)", overflow: "hidden" }}
            >
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAbout((v) => !v)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        width: "100%",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "var(--font-main)",
                        padding: 0,
                    }}
                >
                    <Users size={18} style={{ color: "var(--clr-primary)" }} />
                    <span
                        className="section-title"
                        style={{ fontSize: 16, flex: 1, textAlign: "left" }}
                    >
                        About
                    </span>
                    {showAbout ? (
                        <ChevronUp size={18} style={{ color: "var(--clr-text-muted)" }} />
                    ) : (
                        <ChevronDown size={18} style={{ color: "var(--clr-text-muted)" }} />
                    )}
                </motion.button>

                <AnimatePresence>
                    {showAbout && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            style={{ overflow: "hidden" }}
                        >
                            <div style={{ paddingTop: 20 }}>
                                {/* App info */}
                                <div
                                    style={{
                                        textAlign: "center",
                                        marginBottom: 24,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 36,
                                            marginBottom: 8,
                                        }}
                                    >
                                        💰
                                    </div>
                                    <h3
                                        style={{
                                            fontSize: 18,
                                            fontWeight: 800,
                                            letterSpacing: "-0.02em",
                                            background: "var(--grad-hero)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            backgroundClip: "text",
                                        }}
                                    >
                                        Billionaire in Transit
                                    </h3>
                                    <p
                                        style={{
                                            fontSize: 12,
                                            color: "var(--clr-text-muted)",
                                            marginTop: 4,
                                        }}
                                    >
                                        v1.0 — Budget, Tax & Financial Planner
                                    </p>
                                </div>

                                {/* Section title */}
                                <p
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 700,
                                        color: "var(--clr-text-secondary)",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.06em",
                                        marginBottom: 16,
                                        textAlign: "center",
                                    }}
                                >
                                    The Planning Team
                                </p>

                                {/* Featured directors — larger cards */}
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(2, 1fr)",
                                        gap: 12,
                                        marginBottom: 16,
                                    }}
                                >
                                    {TEAM_MEMBERS.filter((m) => m.featured).map((member) => (
                                        <motion.div
                                            key={member.name}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3 }}
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                gap: 10,
                                                padding: "20px 12px",
                                                borderRadius: 16,
                                                background: "var(--clr-bg)",
                                                border: "1px solid var(--clr-border)",
                                            }}
                                        >
                                            <TeamAvatar member={member} size={72} />
                                            <div style={{ textAlign: "center" }}>
                                                <p
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                        color: "var(--clr-text)",
                                                        marginBottom: 4,
                                                    }}
                                                >
                                                    {member.name}
                                                </p>
                                                <RoleBadge role={member.role} />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Other members — compact list */}
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 10,
                                    }}
                                >
                                    {TEAM_MEMBERS.filter((m) => !m.featured).map((member) => (
                                        <motion.div
                                            key={member.name}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3 }}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 12,
                                                padding: "12px 14px",
                                                borderRadius: 14,
                                                background: "var(--clr-bg)",
                                                border: "1px solid var(--clr-border)",
                                            }}
                                        >
                                            <TeamAvatar member={member} size={44} />
                                            <div style={{ flex: 1 }}>
                                                <p
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        color: "var(--clr-text)",
                                                    }}
                                                >
                                                    {member.name}
                                                </p>
                                                <RoleBadge role={member.role} />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* ── Coffee CTA ── */}
                                <div
                                    style={{
                                        marginTop: 24,
                                        padding: "16px 18px",
                                        borderRadius: 16,
                                        background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(249,115,22,0.08))",
                                        border: "1.5px solid rgba(245,158,11,0.2)",
                                        textAlign: "center",
                                    }}
                                >
                                    <div style={{ fontSize: 28, marginBottom: 8 }}>
                                        <Coffee
                                            size={28}
                                            style={{
                                                display: "inline",
                                                color: "#d97706",
                                                verticalAlign: "middle",
                                            }}
                                        />{" "}
                                        ☕
                                    </div>
                                    <p
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 600,
                                            color: "var(--clr-text)",
                                            marginBottom: 6,
                                        }}
                                    >
                                        Enjoying the app?
                                    </p>
                                    <p
                                        style={{
                                            fontSize: 12,
                                            color: "var(--clr-text-secondary)",
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        If you like our app, kindly support by buying us a cup of
                                        coffee. Use our last 4 digits to credit our MoMo account.
                                    </p>
                                    <div
                                        style={{
                                            marginTop: 12,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 6,
                                            padding: "8px 20px",
                                            borderRadius: 24,
                                            background: "var(--clr-primary)",
                                            color: "white",
                                            fontSize: 14,
                                            fontWeight: 700,
                                        }}
                                    >
                                        <Heart size={14} /> Made with love
                                    </div>
                                </div>

                                {/* Footer */}
                                <p
                                    style={{
                                        fontSize: 11,
                                        color: "var(--clr-text-muted)",
                                        textAlign: "center",
                                        marginTop: 16,
                                    }}
                                >
                                    All data is stored locally on your device.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
