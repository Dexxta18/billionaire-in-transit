import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import {
    Calculator,
    TrendingDown,
    Wallet,
    Info,
} from "lucide-react";

import MetricCard from "../components/MetricCard";
import {
    formatNGN,
    clamp,
    calculateNewNigeriaTaxActPIT,
} from "../utils/calculations";

export default function TaxCalculator({ taxInput, setTaxInput }) {
    // Format number with commas for display in inputs
    const formatWithCommas = (val) => {
        const n = Number(val) || 0;
        if (n === 0) return "";
        return n.toLocaleString("en-NG");
    };
    // Strip commas and parse
    const parseNum = (str) => Number(String(str).replace(/,/g, "")) || 0;

    const annualGrossForTax = useMemo(() => {
        const m = Number(taxInput.monthlyGross) || 0;
        const a = Number(taxInput.annualGross) || 0;
        return taxInput.periodMode === "monthly" ? m * 12 : a;
    }, [taxInput]);

    const nhfBasisAmount = annualGrossForTax;

    const result = useMemo(
        () =>
            calculateNewNigeriaTaxActPIT({
                annualGross: annualGrossForTax,
                includeNHF: !!taxInput.includeNHF,
                nhfRate: Number(taxInput.nhfRate) || 2.5,
                nhfBasisAmount,
                pensionRate: Number(taxInput.pensionRate) || 0,
                annualRentPaid: Number(taxInput.annualRentPaid) || 0,
            }),
        [annualGrossForTax, taxInput, nhfBasisAmount]
    );

    const breakdownRows = [
        ["Gross income", result.gross],
        ["Pension", result.pension],
        ["NHF", result.nhf],
        ["Rent paid", result.rentPaid],
        ["Rent relief", result.rentRelief],
        ["Taxable income", result.taxableIncome],
        ["Annual tax", result.tax],
        ["Monthly tax", result.monthlyTax],
        ["Net monthly take-home", result.netMonthly],
    ];

    const chartData = [
        { label: "Gross", value: Math.round(result.gross) },
        { label: "Deductions", value: Math.round(result.pension + result.nhf + result.rentRelief) },
        { label: "Taxable", value: Math.round(result.taxableIncome) },
        { label: "Tax", value: Math.round(result.tax) },
        { label: "Net", value: Math.round(result.netAnnual) },
    ];

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
                    Tax Calculator
                </h2>
                <p style={{ fontSize: 13, color: "var(--clr-text-muted)", marginTop: 2 }}>
                    Nigeria Tax Act (NTA) 2025/2026 PAYE
                </p>
            </div>

            {/* ── Input Form ── */}
            <div
                className="glass-card"
                style={{
                    padding: 20,
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                }}
            >
                {/* Period Mode + Gross */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                        <label className="field-label">Input mode</label>
                        <select
                            value={taxInput.periodMode}
                            onChange={(e) =>
                                setTaxInput((v) => ({ ...v, periodMode: e.target.value }))
                            }
                            className="input-field"
                        >
                            <option value="monthly">Monthly gross</option>
                            <option value="annual">Annual gross</option>
                        </select>
                    </div>
                    <div>
                        <label className="field-label">
                            {taxInput.periodMode === "monthly"
                                ? "Monthly gross (₦)"
                                : "Annual gross (₦)"}
                        </label>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={formatWithCommas(
                                taxInput.periodMode === "monthly"
                                    ? taxInput.monthlyGross
                                    : taxInput.annualGross
                            )}
                            onChange={(e) => {
                                const val = parseNum(e.target.value);
                                setTaxInput((v) =>
                                    taxInput.periodMode === "monthly"
                                        ? { ...v, monthlyGross: val }
                                        : { ...v, annualGross: val }
                                );
                            }}
                            className="input-field"
                        />
                    </div>
                </div>

                {/* Annual Gross Display */}
                <div
                    style={{
                        padding: "12px 16px",
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(99, 102, 241, 0.06)",
                        border: "1px solid rgba(99, 102, 241, 0.15)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 13,
                    }}
                >
                    <span style={{ color: "var(--clr-text-secondary)" }}>
                        Annual gross for computation
                    </span>
                    <span style={{ fontWeight: 700, color: "var(--clr-primary)" }}>
                        {formatNGN(annualGrossForTax)}
                    </span>
                </div>

                {/* Pension + Rent */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                        <label className="field-label">Pension rate (%)</label>
                        <input
                            type="number"
                            min="0"
                            max="30"
                            step="0.1"
                            value={taxInput.pensionRate}
                            onChange={(e) =>
                                setTaxInput((v) => ({
                                    ...v,
                                    pensionRate: clamp(Number(e.target.value) || 0, 0, 30),
                                }))
                            }
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label className="field-label">Annual rent paid (₦)</label>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={formatWithCommas(taxInput.annualRentPaid)}
                            onChange={(e) =>
                                setTaxInput((v) => ({
                                    ...v,
                                    annualRentPaid: parseNum(e.target.value),
                                }))
                            }
                            className="input-field"
                        />
                    </div>
                </div>

                {/* NHF Section */}
                <div
                    style={{
                        padding: 16,
                        borderRadius: "var(--radius-sm)",
                        border: "1.5px solid var(--clr-border)",
                    }}
                >
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            cursor: "pointer",
                            marginBottom: 12,
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={!!taxInput.includeNHF}
                            onChange={(e) =>
                                setTaxInput((v) => ({ ...v, includeNHF: e.target.checked }))
                            }
                        />
                        <span
                            style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: "var(--clr-text)",
                            }}
                        >
                            Include NHF
                        </span>
                        <span
                            style={{
                                fontSize: 11,
                                color: "var(--clr-text-muted)",
                                marginLeft: "auto",
                            }}
                        >
                            Default: 2.5%
                        </span>
                    </label>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div>
                            <label className="field-label">NHF rate (%)</label>
                            <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={taxInput.nhfRate}
                                onChange={(e) =>
                                    setTaxInput((v) => ({
                                        ...v,
                                        nhfRate: clamp(Number(e.target.value) || 0, 0, 10),
                                    }))
                                }
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="field-label">Calculated NHF</label>
                            <div
                                className="input-field"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    fontWeight: 600,
                                    color: "var(--clr-primary)",
                                    background: "rgba(99,102,241,0.06)",
                                    cursor: "default",
                                }}
                            >
                                {taxInput.includeNHF ? formatNGN(result.nhf) : "—"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Summary Cards ── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 12,
                }}
            >
                <MetricCard
                    title="Annual PAYE"
                    value={formatNGN(result.tax)}
                    icon={TrendingDown}
                    gradient="grad-expense"
                    hint={`${(result.effectiveRate * 100).toFixed(2)}% effective`}
                    delay={0}
                />
                <MetricCard
                    title="Monthly Tax"
                    value={formatNGN(result.monthlyTax)}
                    icon={Calculator}
                    hint="Deducted from pay"
                    delay={0.05}
                />
                <MetricCard
                    title="Net Annual"
                    value={formatNGN(result.netAnnual)}
                    icon={Wallet}
                    gradient="grad-income"
                    delay={0.1}
                />
                <MetricCard
                    title="Net Monthly"
                    value={formatNGN(result.netMonthly)}
                    icon={Wallet}
                    gradient="grad-net"
                    hint="Take-home pay"
                    delay={0.15}
                />
            </div>

            {/* ── Breakdown ── */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: 18, borderRadius: "var(--radius-md)" }}
            >
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--clr-text)", marginBottom: 14 }}>
                    NTA 2025/2026 Breakdown
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {breakdownRows.map(([name, val], idx) => {
                        const isBold = name === "Annual tax" || name === "Net monthly take-home";
                        return (
                            <div
                                key={idx}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    paddingBottom: 8,
                                    borderBottom:
                                        idx < breakdownRows.length - 1
                                            ? "1px solid var(--clr-border)"
                                            : "none",
                                }}
                            >
                                <span style={{ fontSize: 13, color: "var(--clr-text-secondary)" }}>
                                    {name}
                                </span>
                                <span
                                    style={{
                                        fontSize: 13,
                                        fontWeight: isBold ? 700 : 500,
                                        color: isBold ? "var(--clr-text)" : "var(--clr-text-secondary)",
                                    }}
                                >
                                    {formatNGN(val)}
                                </span>
                            </div>
                        );
                    })}
                </div>
                <div
                    style={{
                        marginTop: 12,
                        padding: "8px 12px",
                        borderRadius: "var(--radius-sm)",
                        background:
                            result.effectiveRate > 0.15
                                ? "rgba(239, 68, 68, 0.08)"
                                : "rgba(16, 185, 129, 0.08)",
                        fontSize: 12,
                        fontWeight: 600,
                        color:
                            result.effectiveRate > 0.15
                                ? "var(--clr-danger)"
                                : "var(--clr-success)",
                        textAlign: "center",
                    }}
                >
                    Effective rate: {(result.effectiveRate * 100).toFixed(2)}%
                </div>
            </motion.div>

            {/* ── Chart ── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="glass-card"
                style={{ padding: 18, borderRadius: "var(--radius-md)" }}
            >
                <p className="section-title" style={{ fontSize: 15, marginBottom: 14 }}>
                    Income Flow
                </p>
                <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                            <YAxis
                                tickFormatter={(v) =>
                                    v >= 1000000
                                        ? `${(v / 1000000).toFixed(1)}m`
                                        : `${(v / 1000).toFixed(0)}k`
                                }
                                tick={{ fontSize: 11 }}
                            />
                            <Tooltip
                                formatter={(value) => formatNGN(Number(value))}
                                contentStyle={{
                                    borderRadius: 12,
                                    border: "1px solid var(--clr-border)",
                                    background: "var(--clr-surface-solid)",
                                    color: "var(--clr-text)",
                                }}
                            />
                            <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* ── Disclaimer ── */}
            <div
                style={{
                    display: "flex",
                    gap: 10,
                    padding: "14px 16px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid rgba(245, 158, 11, 0.2)",
                    background: "rgba(245, 158, 11, 0.05)",
                    fontSize: 12,
                    color: "var(--clr-text-secondary)",
                }}
            >
                <Info
                    size={16}
                    style={{ color: "var(--clr-warning)", flexShrink: 0, marginTop: 1 }}
                />
                <span>
                    Simplified PAYE computation for planning purposes. Not legal or tax
                    filing advice. Consult your tax professional.
                </span>
            </div>
        </motion.div>
    );
}
