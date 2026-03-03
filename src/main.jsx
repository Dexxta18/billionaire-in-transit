import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Register service worker and dispatch event when update is available
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
    onNeedRefresh() {
        // Dispatch custom event so App can show update banner
        window.dispatchEvent(new CustomEvent("sw-update-available", { detail: { updateSW } }));
    },
    onOfflineReady() {
        console.log("[PWA] Offline-ready");
    },
});

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
