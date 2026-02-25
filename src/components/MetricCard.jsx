import React from "react";
import { motion } from "framer-motion";

export default function MetricCard({
    title,
    value,
    hint,
    icon: Icon,
    gradient,
    delay = 0,
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay, ease: "easeOut" }}
            className={gradient || "glass-card"}
            style={{
                padding: "18px 20px",
                borderRadius: "var(--radius-md)",
                position: "relative",
                overflow: "hidden",
                minHeight: 110,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }}
        >
            {/* Decorative glow circle */}
            {gradient && (
                <div
                    style={{
                        position: "absolute",
                        top: -20,
                        right: -20,
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.15)",
                        pointerEvents: "none",
                    }}
                />
            )}

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <p
                    style={{
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        opacity: gradient ? 0.85 : 1,
                        color: gradient ? "rgba(255,255,255,0.85)" : "var(--clr-text-secondary)",
                    }}
                >
                    {title}
                </p>

                {Icon && (
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: "var(--radius-sm)",
                            background: gradient
                                ? "rgba(255,255,255,0.18)"
                                : "var(--clr-surface-solid)",
                            border: gradient
                                ? "1px solid rgba(255,255,255,0.2)"
                                : "1px solid var(--clr-border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Icon
                            size={18}
                            color={gradient ? "white" : "var(--clr-text-secondary)"}
                        />
                    </div>
                )}
            </div>

            <div style={{ position: "relative", zIndex: 1, marginTop: 8 }}>
                <p
                    style={{
                        fontSize: 22,
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
                        color: gradient ? "white" : "var(--clr-text)",
                    }}
                >
                    {value}
                </p>
                {hint && (
                    <p
                        style={{
                            fontSize: 12,
                            marginTop: 3,
                            opacity: gradient ? 0.8 : 1,
                            color: gradient ? "rgba(255,255,255,0.75)" : "var(--clr-text-muted)",
                        }}
                    >
                        {hint}
                    </p>
                )}
            </div>
        </motion.div>
    );
}
