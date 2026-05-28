import { useState, useEffect, useRef } from "react";

const KafkaMonitor = ({ invoices }) => {
  const [selectedTopic, setSelectedTopic] = useState("invoice-raw-ingest");
  const [activePartition, setActivePartition] = useState(0);
  const [partitionOffsets, setPartitionOffsets] = useState([12, 18, 14]);
  const [consumerGroupLag, setConsumerGroupLag] = useState([0, 0, 0]);
  const [brokerStatus, setBrokerStatus] = useState("HEALTHY");
  const [logs, setLogs] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activePackets, setActivePackets] = useState([]);
  const logEndRef = useRef(null);

  // Initialize logs on mount or invoice load
  useEffect(() => {
    if (invoices && invoices.length > 0) {
      const initialLogs = [
        `[${new Date().toLocaleTimeString()}] [System] Kafka Broker cluster initialized at PLAINTEXT://localhost:9092`,
        `[${new Date().toLocaleTimeString()}] [Broker] Created metadata topic "invoice-raw-ingest" with 3 partitions and replication factor 1`,
        `[${new Date().toLocaleTimeString()}] [Broker] Created metadata topic "invoice-processed" with 3 partitions and replication factor 1`,
        `[${new Date().toLocaleTimeString()}] [ConsumerGroup] Spark-DataFrame-Consumer joined group "spark-analytics-pipeline"`,
        `[${new Date().toLocaleTimeString()}] [ConsumerGroup] Rebalanced: Partition 0 -> Consumer-0, Partition 1 -> Consumer-1, Partition 2 -> Consumer-2`,
      ];
      
      // Generate streaming ingestion logs based on the loaded invoices
      invoices.forEach((inv, index) => {
        const timestamp = new Date(Date.now() - (invoices.length - index) * 2000).toLocaleTimeString();
        const p = index % 3;
        initialLogs.push(
          `[${timestamp}] [Producer] Sent record to partition ${p} (Key: "${inv.serialNumber || `KEY-${index}`}")`,
          `[${timestamp}] [Broker] Topic "invoice-raw-ingest" Partition ${p} | Committed Offset ${100 + index} for message key: ${inv.serialNumber}`,
          `[${timestamp}] [Consumer] Group "spark-analytics-pipeline" Polled record from partition ${p} offset ${100 + index}`,
          `[${timestamp}] [Consumer] Deserialized invoice schema: { customer: "${inv.customerName || "N/A"}", amount: ${inv.totalAmount || 0} }`,
          `[${timestamp}] [Consumer] Dispatched record to downstream SparkSession DataFrame (df_invoices)`
        );
      });

      setLogs(initialLogs);
      
      // Set offsets corresponding to invoice count
      const newOffsets = [12, 18, 14];
      invoices.forEach((_, idx) => {
        newOffsets[idx % 3] += 1;
      });
      setPartitionOffsets(newOffsets);
      setConsumerGroupLag([0, 0, 0]);
    } else {
      setLogs([
        `[${new Date().toLocaleTimeString()}] [System] Kafka Broker cluster standing by at PLAINTEXT://localhost:9092`,
        `[${new Date().toLocaleTimeString()}] [Broker] Topic "invoice-raw-ingest" is EMPTY. Waiting for document uploads...`,
        `[${new Date().toLocaleTimeString()}] [System] To stream data, upload invoice files in the panel above.`
      ]);
      setPartitionOffsets([0, 0, 0]);
      setConsumerGroupLag([0, 0, 0]);
    }
  }, [invoices]);

  // Scroll to bottom of logs
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Simulating animation
  useEffect(() => {
    if (invoices.length === 0) return;

    const interval = setInterval(() => {
      // Pick random invoice to "re-stream" as a physical data packet
      const randInv = invoices[Math.floor(Math.random() * invoices.length)];
      const partition = Math.floor(Math.random() * 3);
      
      const newPacket = {
        id: Date.now(),
        key: randInv.serialNumber || "RAW-MSG",
        partition,
        yStart: 45,
        yEnd: 105 + partition * 60,
      };

      setActivePackets(prev => [...prev, newPacket]);

      // Add a log entry for the simulated re-stream
      const time = new Date().toLocaleTimeString();
      setLogs(prev => [
        ...prev,
        `[${time}] [Producer] Streaming Message Key: "${newPacket.key}" to partition ${partition}`,
        `[${time}] [Broker] Acknowledged message on Partition ${partition} | New Offset ${partitionOffsets[partition] + 1}`,
        `[${time}] [Consumer] Polled partition ${partition} | Ingested by Spark engine`
      ].slice(-100)); // limit log to last 100 rows

      setPartitionOffsets(prev => {
        const next = [...prev];
        next[partition] += 1;
        return next;
      });

      // Clear packet after animation finishes (1.2s)
      setTimeout(() => {
        setActivePackets(prev => prev.filter(p => p.id !== newPacket.id));
      }, 1200);

    }, 3500);

    return () => clearInterval(interval);
  }, [invoices, partitionOffsets]);

  const triggerBrokerRebalance = () => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [
      ...prev,
      `[${time}] [System] Triggering manual partition rebalance request...`,
      `[${time}] [ConsumerGroup] Heartbeat detected. Revoking partition assignments...`,
      `[${time}] [ConsumerGroup] Re-joining group "spark-analytics-pipeline"`,
      `[${time}] [ConsumerGroup] SyncGroup completed. Assigned: Partition 0 -> Consumer-0, Partition 1 -> Consumer-1, Partition 2 -> Consumer-2`,
      `[${time}] [System] Partition assignment rebalanced successfully!`
    ]);
  };

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
      `}</style>
      {/* GRID CONFIG & KAFKA MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: PIPELINE METRICS & SYSTEM METADATA */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#020617] border border-gray-700 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Cluster Metadata
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Cluster Status:</span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                  brokerStatus === "HEALTHY" ? "bg-teal-950 text-teal-400 border border-teal-800" : "bg-red-950 text-red-400 border border-red-800"
                }`}>
                  {brokerStatus}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Brokers Online:</span>
                <span className="text-white font-mono font-semibold">1 (Leader @ 9092)</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Replication Factor:</span>
                <span className="text-white font-mono">1 (In-Memory Frontend Mode)</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Consumer Group ID:</span>
                <span className="text-teal-400 font-mono text-[11px] truncate">spark-analytics-pipeline</span>
              </div>
            </div>

            <div className="mt-5 border-t border-gray-800 pt-4 space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                  Active Monitoring Topic:
                </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full bg-[#0d1117] border border-gray-700 text-xs text-white rounded-lg p-2 font-mono focus:ring-1 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="invoice-raw-ingest">invoice-raw-ingest (Ingestion)</option>
                  <option value="invoice-processed">invoice-processed (Spark Stream)</option>
                </select>
              </div>

              <button
                onClick={triggerBrokerRebalance}
                className="w-full bg-teal-900/40 hover:bg-teal-900/70 border border-teal-700/60 hover:border-teal-600 text-teal-300 font-medium text-xs py-2 px-3 rounded-lg transition"
              >
                Rebalance Consumer Group
              </button>
            </div>
          </div>

          <div className="bg-[#020617] border border-gray-700 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
              Partition Status
            </h3>
            
            <div className="space-y-3 font-mono text-xs">
              {[0, 1, 2].map((p) => (
                <div 
                  key={p} 
                  onClick={() => setActivePartition(p)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition ${
                    activePartition === p 
                      ? "bg-teal-950/40 border-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.15)]" 
                      : "bg-[#0d1117]/50 border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-200">Partition {p}</span>
                    <span className="text-[10px] text-teal-400">Offset: {partitionOffsets[p]}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-500">
                    <span>Replication: ISR</span>
                    <span>Consumer Lag: 0</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (2/3 width): DYNAMIC SVG VISUALIZATION DAG */}
        <div className="lg:col-span-2 bg-[#020617] border border-gray-700 rounded-xl p-6 shadow-lg flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Real-time Event Streaming Architecture
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Visualizing document upload bytes serialized into Kafka partitions & processed by consumers.
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
                <span className="text-[10px] font-mono text-teal-400 uppercase font-bold tracking-wider">LIVE</span>
              </div>
            </div>

            {/* PIPELINE DAG RENDER */}
            <div className="relative border border-gray-800 bg-[#070b13] rounded-lg h-56 flex items-center justify-between p-4 overflow-hidden">
              
              {/* Animation Layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {activePackets.map(p => (
                  <g key={p.id}>
                    {/* Path 1: Producer to Partition */}
                    <path
                      d={`M 65 45 Q 120 45, 140 ${p.yEnd}`}
                      fill="none"
                      stroke="rgba(20, 184, 166, 0.4)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      className="animate-[dash_1s_linear_infinite]"
                    />
                    {/* Packet Ball */}
                    <circle r="5" fill="#14b8a6" className="shadow-[0_0_8px_#14b8a6]">
                      <animateMotion
                        path={`M 65 45 Q 120 45, 140 ${p.yEnd}`}
                        dur="0.6s"
                        repeatCount="1"
                        fill="freeze"
                      />
                    </circle>

                    {/* Path 2: Partition to Consumer */}
                    <path
                      d={`M 260 ${p.yEnd} Q 310 ${p.yEnd}, 365 ${p.yEnd}`}
                      fill="none"
                      stroke="rgba(168, 85, 247, 0.4)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      className="animate-[dash_1s_linear_infinite]"
                    />
                    {/* Packet Consumer Ball */}
                    <circle r="4" fill="#a855f7" className="shadow-[0_0_8px_#a855f7]">
                      <animateMotion
                        path={`M 260 ${p.yEnd} Q 310 ${p.yEnd}, 365 ${p.yEnd}`}
                        begin="0.6s"
                        dur="0.6s"
                        repeatCount="1"
                        fill="freeze"
                      />
                    </circle>
                  </g>
                ))}
              </svg>

              {/* Node 1: Producer */}
              <div className="flex flex-col items-center justify-center bg-[#0d111c] border border-teal-800 rounded-lg p-3 w-28 h-20 text-center z-20">
                <span className="text-[10px] text-teal-400 font-bold tracking-wider font-mono">PRODUCER</span>
                <span className="text-[11px] font-semibold text-white mt-1">Invoice Client</span>
                <div className="flex items-center space-x-1 mt-1 bg-teal-950/40 px-2 py-0.5 rounded border border-teal-800/30">
                  <span className="text-[8px] text-teal-400 font-mono">active</span>
                </div>
              </div>

              {/* Node 2: Partitions */}
              <div className="flex flex-col space-y-4 z-20 w-44">
                {[0, 1, 2].map(p => (
                  <div 
                    key={p}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg border font-mono ${
                      activePartition === p 
                        ? "bg-teal-950/30 border-teal-500" 
                        : "bg-[#0d111c]/60 border-gray-800"
                    }`}
                  >
                    <div className="flex flex-col text-[10px]">
                      <span className="text-gray-400 text-[9px]">PARTITION {p}</span>
                      <span className="text-white text-[10px] truncate max-w-[90px]">
                        {invoices.length > 0 ? `offset: ${partitionOffsets[p]}` : "empty"}
                      </span>
                    </div>
                    <div className={`h-2.5 w-2.5 rounded-full ${
                      invoices.length > 0 ? "bg-teal-400 shadow-[0_0_6px_#14b8a6] animate-pulse" : "bg-gray-700"
                    }`} />
                  </div>
                ))}
              </div>

              {/* Node 3: Consumers */}
              <div className="flex flex-col space-y-4 z-20 w-32">
                {[0, 1, 2].map(c => (
                  <div 
                    key={c}
                    className="flex items-center space-x-2 bg-[#0d111c] border border-purple-900/60 rounded-lg px-2.5 py-1.5 text-center font-mono text-[9px]"
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-purple-400 font-bold">SPARK CONSUMER</span>
                      <span className="text-gray-400 font-mono text-[8px] truncate">id: consumer-{c}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          <div className="mt-4 border border-gray-800/80 bg-gray-950/50 rounded-lg p-3 text-[11px] text-gray-400 flex items-center space-x-3">
            <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800 text-[9px] font-mono font-bold">INFO</span>
            <p>
              When a client triggers document data extractions via Gemini, the raw events are queued into Kafka partitions, serialized, and then pulled directly into the downstream Spark DataFrames instantly.
            </p>
          </div>
        </div>

      </div>

      {/* LOWER SECTION: KAFKA Monospace Stream Logger Terminal Console */}
      <div className="bg-[#020617] border border-gray-700 rounded-xl p-5 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
            </div>
            <h3 className="text-sm font-semibold text-gray-300 font-mono ml-2">
              kafka-live-broker-logs.sh
            </h3>
          </div>
          <button 
            onClick={() => setLogs([])}
            className="text-[10px] text-gray-500 hover:text-gray-300 font-mono border border-gray-800 hover:border-gray-700 px-2.5 py-1 rounded transition"
          >
            Clear Console
          </button>
        </div>

        <div className="bg-[#070b13] border border-gray-800 rounded-lg p-4 h-60 overflow-y-auto font-mono text-xs text-gray-300 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          {logs.map((log, idx) => {
            let colorClass = "text-gray-400";
            if (log.includes("[Producer]")) colorClass = "text-teal-400";
            else if (log.includes("[Broker]")) colorClass = "text-blue-400";
            else if (log.includes("[Consumer]")) colorClass = "text-purple-400 font-medium";
            else if (log.includes("[System]")) colorClass = "text-yellow-400 font-bold";
            
            return (
              <div key={idx} className={`${colorClass} leading-relaxed break-all`}>
                {log}
              </div>
            );
          })}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
};

export default KafkaMonitor;
