import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, ArrowRight } from "lucide-react";

/**
 * One-time onboarding screen to collect the user's name.
 * Shown after the splash on first launch.
 */
export default function OnboardingScreen({ onComplete }) {
    const [name, setName] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (trimmed) {
            onComplete(trimmed);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 99998,
                background: "var(--clr-bg, #0f172a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                style={{
                    width: "100%",
                    maxWidth: 400,
                    textAlign: "center",
                }}
            >
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #6366f1, #818cf8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 24px",
                        boxShadow: "0 8px 32px rgba(99,102,241,0.3)",
                    }}
                >
                    <User size={32} color="white" />
                </motion.div>

                <h2
                    style={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: "var(--clr-text, white)",
                        marginBottom: 8,
                        letterSpacing: "-0.02em",
                    }}
                >
                    What should we call you?
                </h2>
                <p
                    style={{
                        fontSize: 14,
                        color: "var(--clr-text-muted, rgba(255,255,255,0.6))",
                        marginBottom: 32,
                    }}
                >
                    Let's personalize your experience
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                        style={{
                            width: "100%",
                            padding: "14px 18px",
                            fontSize: 16,
                            fontWeight: 500,
                            fontFamily: "var(--font-main, Inter, sans-serif)",
                            borderRadius: 14,
                            border: "2px solid var(--clr-border, rgba(255,255,255,0.1))",
                            background: "var(--clr-surface-solid, rgba(255,255,255,0.05))",
                            color: "var(--clr-text, white)",
                            outline: "none",
                            textAlign: "center",
                            boxSizing: "border-box",
                            transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                        onBlur={(e) =>
                            (e.target.style.borderColor = "var(--clr-border, rgba(255,255,255,0.1))")
                        }
                    />

                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        disabled={!name.trim()}
                        style={{
                            marginTop: 20,
                            width: "100%",
                            padding: "14px 0",
                            fontSize: 15,
                            fontWeight: 700,
                            fontFamily: "var(--font-main, Inter, sans-serif)",
                            color: "white",
                            background: name.trim()
                                ? "linear-gradient(135deg, #6366f1, #818cf8)"
                                : "rgba(99,102,241,0.3)",
                            border: "none",
                            borderRadius: 50,
                            cursor: name.trim() ? "pointer" : "not-allowed",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            boxShadow: name.trim()
                                ? "0 4px 24px rgba(99,102,241,0.4)"
                                : "none",
                            transition: "background 0.2s, box-shadow 0.2s",
                        }}
                    >
                        Continue
                        <ArrowRight size={16} />
                    </motion.button>
                </form>
            </motion.div>
        </motion.div>
    );
}
