import { useState } from "react";
import { useSelector } from "react-redux";
import KafkaMonitor from "./KafkaMonitor";
import SparkStudio from "./SparkStudio";

const PipelineStudio = () => {
  const invoices = useSelector((state) => state.invoices.invoices || []);
  const [activeTab, setActiveTab] = useState("kafka");

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start border-b border-gray-800 pb-5 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-500 animate-pulse shrink-0" />
            Big Data Processing Studio
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Real-time visual Event Streaming Queue and analytical Apache Spark DataFrames computed in-browser.
          </p>
        </div>

        {/* TABS SWITCHER */}
        <div className="flex bg-[#020617] border border-gray-800 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setActiveTab("kafka")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold font-mono transition ${
              activeTab === "kafka"
                ? "bg-teal-950 text-teal-400 border border-teal-800/80 shadow-[0_0_10px_rgba(20,184,166,0.15)]"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3M3 12c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M3 12l-3 3m3-3 3 3" />
            </svg>
            <span>Kafka Ingestion Stream</span>
          </button>

          <button
            onClick={() => setActiveTab("spark")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold font-mono transition ${
              activeTab === "spark"
                ? "bg-purple-950 text-purple-400 border border-purple-800/80 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
            </svg>
            <span>Spark Data Studio</span>
          </button>
        </div>
      </div>

      {/* PIPELINE OVERVIEW DIAGRAM BANNER */}
      {invoices.length > 0 && (
        <div className="bg-gradient-to-r from-teal-950/20 via-purple-950/20 to-teal-950/20 border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div className="flex items-center space-x-3">
            <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-400 font-mono font-bold text-[9px] uppercase border border-teal-800/60 shrink-0">Active Pipelines</span>
            <span className="text-gray-300 font-semibold">Gemini Ingest Spark DataFrame Sync:</span>
            <span className="text-gray-400">{invoices.length} Extracted Invoices streaming into browser node.</span>
          </div>

          <div className="flex items-center space-x-2 font-mono text-[10px] text-gray-500">
            <span>Kafka Offsets: Committed</span>
            <span className="text-gray-700">|</span>
            <span>Spark Catalyst: Optimized</span>
          </div>
        </div>
      )}

      {/* VIEW LOADER */}
      <div className="transition-all duration-300">
        {activeTab === "kafka" ? (
          <KafkaMonitor invoices={invoices} />
        ) : (
          <SparkStudio invoices={invoices} />
        )}
      </div>

    </div>
  );
};

export default PipelineStudio;
