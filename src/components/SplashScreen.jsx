import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Full-screen splash/landing image shown for ~2.5 s on first load,
 * with animated title and slogan, then fades out to reveal the main app.
 */
export default function SplashScreen({ onFinish }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onFinish, 600);
        }, 2800);
        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key="splash"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 99999,
                        background: "#0f172a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                    }}
                >
                    {/* Background image */}
                    <img
                        src="/splash.png"
                        alt=""
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            filter: "brightness(0.45)",
                        }}
                    />

                    {/* Text overlay */}
                    <div
                        style={{
                            position: "relative",
                            zIndex: 2,
                            textAlign: "center",
                            padding: "0 24px",
                        }}
                    >
                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                            style={{
                                fontSize: 36,
                                fontWeight: 800,
                                letterSpacing: "-0.03em",
                                lineHeight: 1.1,
                                color: "white",
                                textShadow: "0 4px 24px rgba(0,0,0,0.5)",
                                margin: 0,
                            }}
                        >
                            Billionaire{" "}
                            <span
                                style={{
                                    background: "linear-gradient(135deg, #818cf8, #6366f1, #a78bfa)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                in Transit
                            </span>
                        </motion.h1>

                        {/* Divider line */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
                            style={{
                                height: 2,
                                background: "linear-gradient(90deg, transparent, #6366f1, transparent)",
                                margin: "16px auto",
                                width: 160,
                                borderRadius: 2,
                            }}
                        />

                        {/* Slogan */}
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.1, duration: 0.7, ease: "easeOut" }}
                            style={{
                                fontSize: 15,
                                fontWeight: 500,
                                color: "rgba(255,255,255,0.85)",
                                letterSpacing: "0.04em",
                                textShadow: "0 2px 12px rgba(0,0,0,0.4)",
                                margin: 0,
                                fontStyle: "italic",
                            }}
                        >
                            Your wealth is loading… manage the journey.
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
