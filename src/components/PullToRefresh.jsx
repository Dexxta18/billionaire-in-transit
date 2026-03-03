import React, { useRef, useState, useCallback, useEffect } from "react";

/**
 * Pull-to-refresh wrapper for iOS PWA (standalone mode).
 * Shows a spinner when user pulls down from the top of the page,
 * then triggers a page reload.
 */
export default function PullToRefresh({ children }) {
    const containerRef = useRef(null);
    const [pulling, setPulling] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const startY = useRef(0);
    const threshold = 80; // px required before refresh triggers

    // Only activate in standalone (PWA) mode
    const isStandalone =
        typeof window !== "undefined" &&
        (window.navigator.standalone === true ||
            window.matchMedia("(display-mode: standalone)").matches);

    const handleTouchStart = useCallback(
        (e) => {
            if (!isStandalone) return;
            // Only trigger if scrolled to top
            if (window.scrollY <= 0) {
                startY.current = e.touches[0].clientY;
                setPulling(true);
            }
        },
        [isStandalone]
    );

    const handleTouchMove = useCallback(
        (e) => {
            if (!pulling) return;
            const diff = e.touches[0].clientY - startY.current;
            if (diff > 0) {
                setPullDistance(Math.min(diff, threshold * 1.5));
            } else {
                setPulling(false);
                setPullDistance(0);
            }
        },
        [pulling, threshold]
    );

    const handleTouchEnd = useCallback(() => {
        if (!pulling) return;
        if (pullDistance >= threshold) {
            // Trigger reload
            window.location.reload();
        }
        setPulling(false);
        setPullDistance(0);
    }, [pulling, pullDistance, threshold]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el || !isStandalone) return;
        el.addEventListener("touchstart", handleTouchStart, { passive: true });
        el.addEventListener("touchmove", handleTouchMove, { passive: true });
        el.addEventListener("touchend", handleTouchEnd);
        return () => {
            el.removeEventListener("touchstart", handleTouchStart);
            el.removeEventListener("touchmove", handleTouchMove);
            el.removeEventListener("touchend", handleTouchEnd);
        };
    }, [isStandalone, handleTouchStart, handleTouchMove, handleTouchEnd]);

    const progress = Math.min(pullDistance / threshold, 1);

    return (
        <div ref={containerRef} style={{ position: "relative" }}>
            {/* Pull indicator */}
            {isStandalone && pullDistance > 10 && (
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        display: "flex",
                        justifyContent: "center",
                        paddingTop: 8,
                        zIndex: 999,
                        transform: `translateY(${pullDistance * 0.4}px)`,
                        opacity: progress,
                        transition: pulling ? "none" : "all 0.25s ease",
                    }}
                >
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "var(--clr-surface-solid)",
                            border: "2px solid var(--clr-border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                        }}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--clr-primary)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                                transform: `rotate(${progress * 360}deg)`,
                                transition: pulling ? "none" : "transform 0.3s ease",
                            }}
                        >
                            <polyline points="1 4 1 10 7 10" />
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                        </svg>
                    </div>
                </div>
            )}
            <div
                style={{
                    transform:
                        isStandalone && pullDistance > 10
                            ? `translateY(${pullDistance * 0.4}px)`
                            : "none",
                    transition: pulling ? "none" : "transform 0.25s ease",
                }}
            >
                {children}
            </div>
        </div>
    );
}
