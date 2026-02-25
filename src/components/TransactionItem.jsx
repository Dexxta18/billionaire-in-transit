import React from "react";
import { motion } from "framer-motion";
import { Trash2, Repeat } from "lucide-react";
import { formatNGN, CATEGORY_ICONS } from "../utils/calculations";

export default function TransactionItem({ transaction, onDelete, delay = 0 }) {
    const t = transaction;
    const isIncome = t.type === "income";

    return (
        <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay }}
            className="glass-card"
            style={{
                padding: "14px 16px",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 8,
            }}
        >
            {/* Category Emoji */}
            <div
                style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: isIncome
                        ? "rgba(16, 185, 129, 0.12)"
                        : "rgba(239, 68, 68, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                }}
            >
                {CATEGORY_ICONS[t.category] || "📦"}
            </div>

            {/* Details */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                        style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "var(--clr-text)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {t.description}
                    </span>
                    {t.recurring && (
                        <Repeat
                            size={13}
                            style={{ color: "var(--clr-primary)", flexShrink: 0 }}
                        />
                    )}
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 3,
                    }}
                >
                    <span className={`badge ${isIncome ? "badge-income" : "badge-expense"}`}>
                        {t.type}
                    </span>
                    <span
                        style={{
                            fontSize: 12,
                            color: "var(--clr-text-muted)",
                        }}
                    >
                        {t.category}
                    </span>
                    <span
                        style={{
                            fontSize: 11,
                            color: "var(--clr-text-muted)",
                        }}
                    >
                        {t.date}
                    </span>
                </div>
                {t.notes && (
                    <p
                        style={{
                            fontSize: 12,
                            color: "var(--clr-text-muted)",
                            marginTop: 4,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {t.notes}
                    </p>
                )}
            </div>

            {/* Amount + Delete */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 6,
                    flexShrink: 0,
                }}
            >
                <span
                    style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: isIncome ? "var(--clr-success)" : "var(--clr-danger)",
                        whiteSpace: "nowrap",
                    }}
                >
                    {isIncome ? "+" : "−"}
                    {formatNGN(Number(t.amount || 0)).replace("NGN", "₦")}
                </span>
                <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => onDelete(t.id)}
                    style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        border: "1px solid var(--clr-border)",
                        background: "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "var(--clr-text-muted)",
                    }}
                    aria-label="Delete transaction"
                >
                    <Trash2 size={14} />
                </motion.button>
            </div>
        </motion.div>
    );
}
