import React from "react";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    PlusCircle,
    Calculator,
    PiggyBank,
    Settings,
} from "lucide-react";

const tabs = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "budget", label: "Budget", icon: PiggyBank },
    { id: "add", label: "Add", icon: PlusCircle },
    { id: "tax", label: "Tax", icon: Calculator },
    { id: "settings", label: "Settings", icon: Settings },
];

export default function BottomNav({ active, onChange }) {
    return (
        <nav
            style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                paddingBottom: "var(--safe-bottom)",
            }}
            className="glass-card-elevated"
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-around",
                    height: "var(--bottom-nav-h)",
                    maxWidth: 520,
                    margin: "0 auto",
                }}
            >
                {tabs.map((tab) => {
                    const isActive = active === tab.id;
                    const Icon = tab.icon;
                    const isAdd = tab.id === "add";

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id)}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 3,
                                padding: "6px 8px",
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                position: "relative",
                                minWidth: 48,
                                WebkitTapHighlightColor: "transparent",
                            }}
                            aria-label={tab.label}
                        >
                            {isAdd ? (
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: "50%",
                                        background: "var(--clr-primary)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginTop: -18,
                                        boxShadow: "var(--glow-primary)",
                                    }}
                                >
                                    <Icon size={24} color="white" />
                                </motion.div>
                            ) : (
                                <>
                                    <motion.div
                                        animate={{
                                            color: isActive
                                                ? "var(--clr-primary)"
                                                : "var(--clr-text-muted)",
                                        }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Icon size={20} />
                                    </motion.div>
                                    <motion.span
                                        animate={{
                                            color: isActive
                                                ? "var(--clr-primary)"
                                                : "var(--clr-text-muted)",
                                        }}
                                        style={{
                                            fontSize: 10,
                                            fontWeight: isActive ? 600 : 400,
                                            fontFamily: "var(--font-main)",
                                        }}
                                    >
                                        {tab.label}
                                    </motion.span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="navIndicator"
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: "50%",
                                                transform: "translateX(-50%)",
                                                width: 24,
                                                height: 3,
                                                borderRadius: 4,
                                                background: "var(--clr-primary)",
                                            }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </>
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
