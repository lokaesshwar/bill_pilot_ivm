import { useState, useEffect } from "react";
import { SparkSession } from "./SparkSession";

const SparkStudio = ({ invoices }) => {
  const [activeQuery, setActiveQuery] = useState("select_all");
  const [showConsole, setShowConsole] = useState(true);
  const [explainPlan, setExplainPlan] = useState("");
  const [asciiTable, setAsciiTable] = useState("");
  const [anomalies, setAnomalies] = useState([]);
  
  // Chart and analytics state
  const [metrics, setMetrics] = useState({
    totalSpend: 0,
    averageSpend: 0,
    paidAmount: 0,
    pendingAmount: 0,
    topVendors: [],
    paymentMethods: {},
  });

  // Extract flat list of products for product analytics
  const getProductsList = () => {
    if (!invoices) return [];
    const products = [];
    invoices.forEach(inv => {
      if (inv && inv.products && Array.isArray(inv.products)) {
        inv.products.forEach(p => {
          if (!p) return;
          products.push({
            invoiceSerial: inv.serialNumber,
            customerName: inv.customerName,
            name: p.name || "N/A",
            quantity: Number(p.quantity) || 0,
            unitPrice: Number(p.unitPrice) || 0,
            taxRate: Number(p.taxRate) || 0,
            taxAmount: Number(p.taxAmount) || 0,
            priceWithTax: Number(p.priceWithTax) || 0,
          });
        });
      }
    });
    return products;
  };

  // Compile calculations when invoices change
  useEffect(() => {
    if (!invoices || invoices.length === 0) {
      setMetrics({
        totalSpend: 0,
        averageSpend: 0,
        paidAmount: 0,
        pendingAmount: 0,
        topVendors: [],
        paymentMethods: {},
      });
      setAnomalies([]);
      setAsciiTable("");
      setExplainPlan("");
      return;
    }

    // 1. Calculate general metrics
    let total = 0;
    let paid = 0;
    let pending = 0;
    const vendorSpendMap = {};
    const paymentMap = {};
    const auditLogs = [];

    invoices.forEach((inv, index) => {
      if (!inv) return;
      const amt = Number(inv.totalAmount) || 0;
      total += amt;

      const pend = Number(inv.amountPending) || 0;
      pending += pend;
      
      const statusLower = String(inv.status || "").toLowerCase();
      if (statusLower.includes("paid") && !statusLower.includes("unpaid")) {
        paid += (amt - pend);
      } else {
        paid += (amt - pend);
      }

      // Vendor grouping
      const vendor = inv.customerCompanyName || inv.customerName || "Unknown Vendor";
      vendorSpendMap[vendor] = (vendorSpendMap[vendor] || 0) + amt;

      // Payment methods
      const method = inv.paymentMethod || "Credit/Bank Transfer";
      paymentMap[method] = (paymentMap[method] || 0) + 1;

      // Compliance Audits / Anomalies detection
      if (amt > 10000) {
        auditLogs.push({
          id: `anomaly-1-${index}`,
          type: "WARNING",
          message: `Invoice #${inv.serialNumber} has unusually high spending limit ($${amt.toLocaleString()})`,
          impact: "HIGH SPEND"
        });
      }
      if (!inv.customerCompanyName && !inv.customerName) {
        auditLogs.push({
          id: `anomaly-2-${index}`,
          type: "CRITICAL",
          message: `Invoice #${inv.serialNumber} missing Customer Name or Company entity identity`,
          impact: "COMPLIANCE RISK"
        });
      }
      if (!inv.gstin && (!inv.customerPhone || inv.customerPhone.length < 5)) {
        auditLogs.push({
          id: `anomaly-3-${index}`,
          type: "NOTICE",
          message: `Invoice #${inv.serialNumber} missing Tax registration ID / GSTIN records`,
          impact: "AUDIT CRITICAL"
        });
      }
      // Check products tax rate exceeding typical bounds
      if (inv.products && Array.isArray(inv.products)) {
        inv.products.forEach((p, idx) => {
          if (!p) return;
          const r = Number(p.taxRate) || 0;
          if (r > 18) {
            auditLogs.push({
              id: `anomaly-4-${index}-${idx}`,
              type: "WARNING",
              message: `Product "${p.name || `Item ${idx}`}" in Invoice #${inv.serialNumber} has high tax rate: ${r}%`,
              impact: "HIGH TAX EXPENSE"
            });
          }
        });
      }
    });

    const sortedVendors = Object.entries(vendorSpendMap)
      .map(([name, spend]) => ({ name, spend: Math.round(spend * 100) / 100 }))
      .sort((a, b) => b.spend - a.spend);

    setMetrics({
      totalSpend: Math.round(total * 100) / 100,
      averageSpend: invoices.length > 0 ? Math.round((total / invoices.length) * 100) / 100 : 0,
      paidAmount: Math.round(paid * 100) / 100,
      pendingAmount: Math.round(pending * 100) / 100,
      topVendors: sortedVendors,
      paymentMethods: paymentMap,
    });

    setAnomalies(auditLogs);
    runSparkEngine(activeQuery);
  }, [invoices, activeQuery]);

  // Execute in-browser Spark SQL engine
  const runSparkEngine = (queryKey) => {
    if (!invoices || invoices.length === 0) return;

    // Create a Spark Session
    const spark = SparkSession.builder.appName("BillPilotSparkStudio").getOrCreate();
    
    // Ingest invoice JSON into DataFrame
    const df = spark.read.json(invoices);
    const dfProducts = spark.read.json(getProductsList());

    let resultDf;
    switch (queryKey) {
      case "select_all":
        resultDf = df.select("serialNumber", "customerName", "totalAmount", "paymentMethod", "status");
        break;
      
      case "vendor_spend":
        resultDf = df.groupBy("customerCompanyName")
          .agg({ totalAmount: "sum" })
          .orderBy("sum(totalAmount)", false);
        break;

      case "unpaid_risk":
        resultDf = df.filter(row => (Number(row.amountPending) || 0) > 0, "amountPending > 0")
          .select("serialNumber", "customerName", "totalAmount", "amountPending", "status");
        break;

      case "product_volumes":
        resultDf = dfProducts.groupBy("name")
          .agg({ quantity: "sum", priceWithTax: "avg" })
          .orderBy("sum(quantity)", false);
        break;

      default:
        resultDf = df;
    }

    setAsciiTable(resultDf.show(20));
    setExplainPlan(resultDf.explain());
  };

  if (!invoices || invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-gray-700 bg-[#020617]/50 rounded-xl min-h-[300px]">
        <div className="h-14 w-14 rounded-full bg-teal-950/50 flex items-center justify-center text-teal-400 border border-teal-800 animate-pulse mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-white">Spark Analytics Studio Standing By</h3>
        <p className="text-sm text-gray-400 max-w-sm mt-2">
          No real invoice data is currently queued inside the Spark stream. Upload structured files in the panel above to begin analysis!
        </p>
      </div>
    );
  }

  // Calculate coordinates for dynamic SVG dashboard charts
  const maxVendorSpend = metrics.topVendors.length > 0 ? Math.max(...metrics.topVendors.map(v => v.spend)) : 100;
  
  // Total pending vs paid ratios
  const totalAmountCalculated = metrics.paidAmount + metrics.pendingAmount;
  const paidPercentage = totalAmountCalculated > 0 ? (metrics.paidAmount / totalAmountCalculated) * 100 : 0;
  const pendingPercentage = totalAmountCalculated > 0 ? (metrics.pendingAmount / totalAmountCalculated) * 100 : 0;

  return (
    <div className="space-y-6">
      
      {/* SPARK METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-[#020617] border border-gray-700 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 h-16 w-16 bg-teal-500/5 blur-xl rounded-full" />
          <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wide">Spark total_spend.sum()</span>
          <p className="text-2xl font-mono font-bold text-teal-400 mt-1">${metrics.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-gray-500 mt-2">Aggregated across {invoices.length} file records.</p>
        </div>

        <div className="bg-[#020617] border border-gray-700 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 h-16 w-16 bg-purple-500/5 blur-xl rounded-full" />
          <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wide">Spark spend.avg()</span>
          <p className="text-2xl font-mono font-bold text-purple-400 mt-1">${metrics.averageSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-gray-500 mt-2">Average revenue spent per document.</p>
        </div>

        <div className="bg-[#020617] border border-gray-700 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 h-16 w-16 bg-emerald-500/5 blur-xl rounded-full" />
          <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wide">Paid Capital (Cleared)</span>
          <p className="text-2xl font-mono font-bold text-emerald-400 mt-1">${metrics.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <div className="w-full bg-gray-800 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${paidPercentage}%` }} />
          </div>
        </div>

        <div className="bg-[#020617] border border-gray-700 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 h-16 w-16 bg-red-500/5 blur-xl rounded-full" />
          <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wide">Pending (Risk Ledger)</span>
          <p className="text-2xl font-mono font-bold text-red-400 mt-1">${metrics.pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <div className="w-full bg-gray-800 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-red-500 h-1 rounded-full" style={{ width: `${pendingPercentage}%` }} />
          </div>
        </div>

      </div>

      {/* SVG REAL-TIME CHARTS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: SPEND BY VENDOR/COMPANY */}
        <div className="bg-[#020617] border border-gray-700 rounded-xl p-5 shadow-lg">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Spark Aggregation: Total Spend by Entity</h3>
            <p className="text-xs text-gray-400 mt-0.5">Computed dynamically in browser from your uploads.</p>
          </div>

          <div className="space-y-4 min-h-[220px] flex flex-col justify-center">
            {metrics.topVendors.length === 0 ? (
              <p className="text-center text-xs text-gray-500">Processing entity metrics...</p>
            ) : (
              metrics.topVendors.slice(0, 4).map((v, i) => {
                const percentage = maxVendorSpend > 0 ? (v.spend / maxVendorSpend) * 100 : 0;
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-gray-300 font-semibold truncate max-w-[200px]">{v.name || "N/A"}</span>
                      <span className="text-teal-400">${v.spend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="w-full bg-gray-900 border border-gray-800 h-3.5 rounded-md overflow-hidden relative">
                      <div 
                        className="bg-gradient-to-r from-teal-600 to-teal-400 h-full rounded-md transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CHART 2: PAYMENTS STATUS & COMPLIANCE SCANNER */}
        <div className="bg-[#020617] border border-gray-700 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-white">Spark Catalyst Audits</h3>
                <p className="text-xs text-gray-400 mt-0.5">Real-time anomaly scanner & structural integrity logs.</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                anomalies.length > 0 ? "bg-amber-950 text-amber-400 border border-amber-800" : "bg-teal-950 text-teal-400 border border-teal-800"
              }`}>
                {anomalies.length} Flagged
              </span>
            </div>

            <div className="space-y-2 h-44 overflow-y-auto pr-1 text-xs">
              {anomalies.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 italic text-center text-xs">
                  ✨ Excellent: No compliance risks or structural data anomalies flagged!
                </div>
              ) : (
                anomalies.map((a, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 p-2 rounded bg-black/30 border border-gray-800 hover:border-gray-700 transition">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 ${
                      a.type === "CRITICAL" ? "bg-red-950 text-red-400 border border-red-800" :
                      a.type === "WARNING" ? "bg-amber-950 text-amber-400 border border-amber-800" :
                      "bg-blue-950 text-blue-400 border border-blue-800"
                    }`}>
                      {a.type}
                    </span>
                    <div className="min-w-0">
                      <p className="text-gray-200 leading-normal">{a.message}</p>
                      <p className="text-[9px] text-gray-500 font-mono mt-0.5">impact_tier: {a.impact}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* INTERACTIVE SPARK DEVELOPER WORKSPACE */}
      <div className="bg-[#020617] border border-gray-700 rounded-xl p-5 shadow-lg">
        
        {/* INTERACTIVE MENU */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-800 pb-4 mb-4 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Spark SQL Developer DataFrame Console</h3>
            <p className="text-xs text-gray-400 mt-0.5">Toggle query operators to compile analytical transformations.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "select_all", label: "invoices.select()" },
              { id: "vendor_spend", label: "groupBy(vendor).sum()" },
              { id: "unpaid_risk", label: "filter(pending > 0)" },
              { id: "product_volumes", label: "products.agg(sum_qty)" },
            ].map(q => (
              <button
                key={q.id}
                onClick={() => setActiveQuery(q.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                  activeQuery === q.id 
                    ? "bg-purple-950/60 border-purple-500 text-purple-200 font-bold shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                    : "bg-[#0d1117] border-gray-800 text-gray-400 hover:text-gray-200"
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* WORKSPACE TAB SWITCHER */}
        <div className="flex space-x-4 mb-3 border-b border-gray-800 pb-1.5">
          <button 
            onClick={() => setShowConsole(true)}
            className={`text-xs font-mono font-bold pb-2 transition-all ${
              showConsole 
                ? "text-teal-400 border-b-2 border-teal-400" 
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            DataFrame.show() Output
          </button>
          
          <button 
            onClick={() => setShowConsole(false)}
            className={`text-xs font-mono font-bold pb-2 transition-all ${
              !showConsole 
                ? "text-purple-400 border-b-2 border-purple-400" 
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            DataFrame.explain(true) Logical Plan
          </button>
        </div>

        {/* DISPLAY MONOSPACE ASCII TABLES */}
        <div className="bg-[#070b13] border border-gray-800 rounded-lg p-4 h-80 overflow-auto font-mono text-xs text-gray-300 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          {showConsole ? (
            <pre className="text-teal-400 whitespace-pre">{asciiTable}</pre>
          ) : (
            <pre className="text-purple-400 whitespace-pre leading-relaxed">{explainPlan}</pre>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-3 text-[10px] text-gray-500 font-mono">
          <span>Target DataFrame: df_invoices_spark</span>
          <span>Optimizer: Spark Catalyst V3.5.0</span>
        </div>

      </div>

    </div>
  );
};

export default SparkStudio;
