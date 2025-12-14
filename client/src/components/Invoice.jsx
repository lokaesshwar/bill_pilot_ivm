import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { setInvoices } from "../features/invoicesSlice.js";
import InitialLoader from "./InitialState.jsx";

const Invoice = () => {
  const dispatch = useDispatch();
  const invoices = useSelector((state) => state.invoices.invoices || []);
  const [rows, setRows] = useState([]);

  // sync redux → local
  useEffect(() => {
    setRows(invoices);
  }, [invoices]);

  // auto-save (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      dispatch(setInvoices(rows));
    }, 400);
    return () => clearTimeout(t);
  }, [rows, dispatch]);

  const updateInvoice = (serial, field, value) => {
    setRows((prev) =>
      prev.map((inv) =>
        inv.serialNumber === serial ? { ...inv, [field]: value } : inv
      )
    );
  };

  const updateItem = (serial, idx, field, value) => {
    setRows((prev) =>
      prev.map((inv) => {
        if (inv.serialNumber !== serial) return inv;
        return {
          ...inv,
          products: inv.products.map((p, i) =>
            i === idx ? { ...p, [field]: value } : p
          ),
        };
      })
    );
  };

  // 🔥 UPDATED INPUT STYLE (NO CUT VALUES)
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
        Invoice Records
      </h2>

      {/* TABLE WRAPPER */}
      <div className="overflow-x-auto rounded-xl border border-gray-700">
        <table className="min-w-max w-full border-collapse text-sm">
          <thead className="bg-[#020617] border-b border-gray-700 sticky top-0 z-10">
            <tr>
              {[
                "Invoice #",
                "Customer",
                "Product",
                "Qty",
                "Tax %",
                "Price (Tax)",
                "Subtotal",
                "Tax Total",
                "Grand Total",
                "Payment",
                "Status",
                "Date",
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
            {rows.map((inv) =>
              inv.products.map((p, i) => (
                <tr
                  key={`${inv.serialNumber}-${i}`}
                  className="border-b border-gray-800 hover:bg-[#020617]/60 transition"
                >
                  {/* INVOICE */}
                  <td className="px-4 py-2 align-middle whitespace-nowrap">
                    {i === 0 ? inv.serialNumber : ""}
                  </td>

                  {/* CUSTOMER */}
                  <td className="px-4 py-2 align-middle">
                    {i === 0 && (
                      <input
                        className={inputClass(inv.customerName)}
                        value={inv.customerName ?? ""}
                        placeholder="❗ missing"
                        onChange={(e) =>
                          updateInvoice(
                            inv.serialNumber,
                            "customerName",
                            e.target.value
                          )
                        }
                      />
                    )}
                  </td>

                  {/* PRODUCT */}
                  <td className="px-4 py-2 align-middle">
                    <input
                      className={inputClass(p.name)}
                      value={p.name ?? ""}
                      placeholder="❗ missing"
                      onChange={(e) =>
                        updateItem(inv.serialNumber, i, "name", e.target.value)
                      }
                    />
                  </td>

                  {/* QTY */}
                  <td className="px-4 py-2 align-middle w-20">
                    <input
                      className={inputClass(p.quantity)}
                      value={p.quantity ?? ""}
                      placeholder="❗ missing"
                      onChange={(e) =>
                        updateItem(
                          inv.serialNumber,
                          i,
                          "quantity",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  {/* TAX % */}
                  <td className="px-4 py-2 align-middle w-20">
                    <input
                      className={inputClass(p.taxRate)}
                      value={p.taxRate ?? ""}
                      placeholder="❗ missing"
                      onChange={(e) =>
                        updateItem(
                          inv.serialNumber,
                          i,
                          "taxRate",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  {/* PRICE WITH TAX */}
                  <td className="px-4 py-2 align-middle w-32">
                    <input
                      className={inputClass(p.priceWithTax)}
                      value={p.priceWithTax ?? ""}
                      placeholder="❗ missing"
                      onChange={(e) =>
                        updateItem(
                          inv.serialNumber,
                          i,
                          "priceWithTax",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  {/* SUBTOTAL */}
                  <td className="px-4 py-2 align-middle w-32">
                    {i === 0 && (
                      <input
                        className={inputClass(inv.amountBeforeTax)}
                        value={inv.amountBeforeTax ?? ""}
                        placeholder="❗ missing"
                        onChange={(e) =>
                          updateInvoice(
                            inv.serialNumber,
                            "amountBeforeTax",
                            e.target.value
                          )
                        }
                      />
                    )}
                  </td>

                  {/* TAX TOTAL */}
                  <td className="px-4 py-2 align-middle w-32">
                    {i === 0 && (
                      <input
                        className={inputClass(inv.taxamount)}
                        value={inv.taxamount ?? ""}
                        placeholder="❗ missing"
                        onChange={(e) =>
                          updateInvoice(
                            inv.serialNumber,
                            "taxamount",
                            e.target.value
                          )
                        }
                      />
                    )}
                  </td>

                  {/* GRAND TOTAL */}
                  <td className="px-4 py-2 align-middle w-36">
                    {i === 0 && (
                      <input
                        className={inputClass(inv.totalAmount)}
                        value={inv.totalAmount ?? ""}
                        placeholder="❗ missing"
                        onChange={(e) =>
                          updateInvoice(
                            inv.serialNumber,
                            "totalAmount",
                            e.target.value
                          )
                        }
                      />
                    )}
                  </td>

                  {/* PAYMENT */}
                  <td className="px-4 py-2 align-middle">
                    {i === 0 && (
                      <input
                        className={inputClass(inv.paymentMethod)}
                        value={inv.paymentMethod ?? ""}
                        placeholder="❗ missing"
                        onChange={(e) =>
                          updateInvoice(
                            inv.serialNumber,
                            "paymentMethod",
                            e.target.value
                          )
                        }
                      />
                    )}
                  </td>

                  {/* STATUS */}
                  <td className="px-4 py-2 align-middle">
                    {i === 0 && (
                      <input
                        className={inputClass(inv.status)}
                        value={inv.status ?? ""}
                        placeholder="❗ missing"
                        onChange={(e) =>
                          updateInvoice(
                            inv.serialNumber,
                            "status",
                            e.target.value
                          )
                        }
                      />
                    )}
                  </td>

                  {/* DATE */}
                  <td className="px-4 py-2 align-middle whitespace-nowrap">
                    {i === 0 && (
                      <span className="px-2 py-1 rounded bg-[#020617] text-gray-300">
                        {inv.invoiceDate || "—"}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Invoice;
