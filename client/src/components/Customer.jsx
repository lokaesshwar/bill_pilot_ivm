import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { setInvoices } from "../features/invoicesSlice.js";
import InitialLoader from "./InitialState.jsx";

const Customers = () => {
  const dispatch = useDispatch();
  const invoices = useSelector((state) => state.invoices.invoices || []);
  const [rows, setRows] = useState([]);
  const initialized = useRef(false);

  // redux → local (ONLY ONCE)
  useEffect(() => {
    if (!initialized.current && invoices.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRows(invoices);
      initialized.current = true;
    }
  }, [invoices]);

  // autosave (debounced)
  useEffect(() => {
    if (!initialized.current) return;

    const t = setTimeout(() => {
      dispatch(setInvoices(rows));
    }, 400);

    return () => clearTimeout(t);
  }, [rows, dispatch]);

  // update invoice-level customer fields
  const updateField = (serial, field, value) => {
    setRows((prev) =>
      prev.map((inv) =>
        inv.serialNumber === serial ? { ...inv, [field]: value } : inv
      )
    );
  };

  // 🔥 SAME INPUT STYLE AS Invoice.jsx
  const inputClass = (val) =>
    `min-w-[120px] bg-[#020617] text-white text-sm px-3 py-1 rounded border
     whitespace-nowrap text-right font-mono
     placeholder:text-red-400 placeholder:italic
     focus:outline-none focus:ring-1 focus:ring-teal-500
     ${val == null ? "border-red-500" : "border-teal-600"}`;

  if (invoices.length === 0) return <InitialLoader />;

  return (
    <div className="text-white">
      <h2 className="text-2xl font-semibold mb-6 text-teal-400">
        Customer Records
      </h2>

      {/* TABLE WRAPPER */}
      <div className="overflow-x-auto rounded-xl border border-gray-700">
        <table className="min-w-max w-full border-collapse text-sm">
          <thead className="bg-[#020617] border-b border-gray-700 sticky top-0 z-10">
            <tr>
              {[
                "Invoice #",
                "Customer Name",
                "Phone",
                "Company",
                "GSTIN",
                "Total Amount",
                "Pending",
                "Status",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-medium text-gray-300 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((inv) => (
              <tr
                key={inv.serialNumber}
                className="border-b border-gray-800 hover:bg-[#020617]/60 transition"
              >
                {/* SERIAL */}
                <td className="px-4 py-2 whitespace-nowrap">
                  {inv.serialNumber}
                </td>

                {/* CUSTOMER NAME */}
                <td className="px-4 py-2">
                  <input
                    className={inputClass(inv.customerName)}
                    value={inv.customerName ?? ""}
                    placeholder="❗ missing"
                    onChange={(e) =>
                      updateField(
                        inv.serialNumber,
                        "customerName",
                        e.target.value
                      )
                    }
                  />
                </td>

                {/* PHONE */}
                <td className="px-4 py-2 w-36">
                  <input
                    className={inputClass(inv.customerPhone)}
                    value={inv.customerPhone ?? ""}
                    placeholder="❗ missing"
                    onChange={(e) =>
                      updateField(
                        inv.serialNumber,
                        "customerPhone",
                        e.target.value
                      )
                    }
                  />
                </td>

                {/* COMPANY */}
                <td className="px-4 py-2">
                  <input
                    className={inputClass(inv.customerCompanyName)}
                    value={inv.customerCompanyName ?? ""}
                    placeholder="❗ missing"
                    onChange={(e) =>
                      updateField(
                        inv.serialNumber,
                        "customerCompanyName",
                        e.target.value
                      )
                    }
                  />
                </td>

                {/* GSTIN */}
                <td className="px-4 py-2">
                  <input
                    className={inputClass(inv.gstin)}
                    value={inv.gstin ?? ""}
                    placeholder="❗ missing"
                    onChange={(e) =>
                      updateField(inv.serialNumber, "gstin", e.target.value)
                    }
                  />
                </td>

                {/* TOTAL */}
                <td className="px-4 py-2 w-32">
                  <input
                    className={inputClass(inv.totalAmount)}
                    value={inv.totalAmount ?? ""}
                    placeholder="❗ missing"
                    onChange={(e) =>
                      updateField(
                        inv.serialNumber,
                        "totalAmount",
                        e.target.value
                      )
                    }
                  />
                </td>

                {/* PENDING */}
                <td className="px-4 py-2 w-32">
                  <input
                    className={inputClass(inv.amountPending)}
                    value={inv.amountPending ?? ""}
                    placeholder="❗ missing"
                    onChange={(e) =>
                      updateField(
                        inv.serialNumber,
                        "amountPending",
                        e.target.value
                      )
                    }
                  />
                </td>

                {/* STATUS */}
                <td className="px-4 py-2">
                  <input
                    className={inputClass(inv.status)}
                    value={inv.status ?? ""}
                    placeholder="❗ missing"
                    onChange={(e) =>
                      updateField(inv.serialNumber, "status", e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;
