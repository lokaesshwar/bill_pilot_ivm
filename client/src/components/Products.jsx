import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { setInvoices } from "../features/invoicesSlice.js";
import InitialLoader from "./InitialState.jsx";

const Products = () => {
  const dispatch = useDispatch();
  const invoices = useSelector((state) => state.invoices.invoices || []);
  const [rows, setRows] = useState([]);
  const [check, setCheck] = useState(false);

  // redux → local
  useEffect(() => {
    setRows(invoices);
  }, [invoices]);

  // autosave (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      dispatch(setInvoices(rows));
    }, 400);
    return () => clearTimeout(t);
  }, [rows, dispatch]);

  // missing products check
  useEffect(() => {
    if (!invoices || invoices.length === 0) return;
    const allMissing = invoices.every((inv) => inv.products.length === 0);
    setCheck(allMissing);
  }, [invoices]);

  const updateProduct = (serial, productIndex, field, value) => {
    setRows((prev) =>
      prev.map((inv) => {
        if (inv.serialNumber !== serial) return inv;
        return {
          ...inv,
          products: inv.products.map((p, i) =>
            i === productIndex ? { ...p, [field]: value } : p
          ),
        };
      })
    );
  };

  // 🔥 SAME INPUT STYLE AS Invoice.jsx
  const inputClass = (val) =>
    `min-w-[110px] bg-[#020617] text-white text-sm px-3 py-1 rounded border
     whitespace-nowrap text-right font-mono
     placeholder:text-red-400 placeholder:italic
     focus:outline-none focus:ring-1 focus:ring-teal-500
     ${val == null ? "border-red-500" : "border-teal-600"}`;

  if (invoices.length === 0 || check) return <InitialLoader />;

  return (
    <div className="text-white">
      <h2 className="text-2xl font-semibold mb-6 text-teal-400">
        Product Records
      </h2>

      {/* TABLE WRAPPER */}
      <div className="overflow-x-auto rounded-xl border border-gray-700">
        <table className="min-w-max w-full border-collapse text-sm">
          <thead className="bg-[#020617] border-b border-gray-700 sticky top-0 z-10">
            <tr>
              {[
                "Invoice #",
                "Product",
                "Qty",
                "Unit Price",
                "Unit",
                "Discount",
                "Taxable Value",
                "Tax %",
                "Tax Amount",
                "Price (Tax)",
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
              inv.products.map((p, idx) => (
                <tr
                  key={`${inv.serialNumber}-${idx}`}
                  className="border-b border-gray-800 hover:bg-[#020617]/60 transition"
                >
                  {/* SERIAL */}
                  <td className="px-4 py-2 whitespace-nowrap">
                    {inv.serialNumber}
                  </td>

                  {/* PRODUCT NAME */}
                  <td className="px-4 py-2">
                    <input
                      className={inputClass(p.name)}
                      value={p.name ?? ""}
                      placeholder="❗ missing"
                      onChange={(e) =>
                        updateProduct(
                          inv.serialNumber,
                          idx,
                          "name",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  {/* QTY */}
                  <td className="px-4 py-2 w-20">
                    <input
                      className={inputClass(p.quantity)}
                      value={p.quantity ?? ""}
                      placeholder="❗ missing"
                      onChange={(e) =>
                        updateProduct(
                          inv.serialNumber,
                          idx,
                          "quantity",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  {/* UNIT PRICE */}
                  <td className="px-4 py-2 w-28">
                    <input
                      className={inputClass(p.unitPrice)}
                      value={p.unitPrice ?? ""}
                      placeholder="❗ missing"
                      onChange={(e) =>
                        updateProduct(
                          inv.serialNumber,
                          idx,
                          "unitPrice",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  {/* UNIT */}
                  <td className="px-4 py-2 w-24">
                    <input
                      className={inputClass(p.unit)}
                      value={p.unit ?? ""}
                      placeholder="❗ missing"
                      onChange={(e) =>
                        updateProduct(
                          inv.serialNumber,
                          idx,
                          "unit",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  {/* DISCOUNT */}
                  <td className="px-4 py-2 w-24">
                    <input
                      className={inputClass(p.discount)}
                      value={p.discount ?? ""}
                      placeholder="❗ missing"
                      onChange={(e) =>
                        updateProduct(
                          inv.serialNumber,
                          idx,
                          "discount",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  {/* TAXABLE VALUE */}
                  <td className="px-4 py-2 w-32">
                    <input
                      className={inputClass(p.taxableValue)}
                      value={p.taxableValue ?? ""}
                      placeholder="❗ missing"
                      onChange={(e) =>
                        updateProduct(
                          inv.serialNumber,
                          idx,
                          "taxableValue",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  {/* TAX % */}
                  <td className="px-4 py-2 w-20">
                    <input
                      className={inputClass(p.taxRate)}
                      value={p.taxRate ?? ""}
                      placeholder="❗ missing"
                      onChange={(e) =>
                        updateProduct(
                          inv.serialNumber,
                          idx,
                          "taxRate",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  {/* TAX AMOUNT */}
                  <td className="px-4 py-2 w-28">
                    <input
                      className={inputClass(p.taxAmount)}
                      value={p.taxAmount ?? ""}
                      placeholder="❗ missing"
                      onChange={(e) =>
                        updateProduct(
                          inv.serialNumber,
                          idx,
                          "taxAmount",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  {/* PRICE WITH TAX */}
                  <td className="px-4 py-2 w-32">
                    <input
                      className={inputClass(p.priceWithTax)}
                      value={p.priceWithTax ?? ""}
                      placeholder="❗ missing"
                      onChange={(e) =>
                        updateProduct(
                          inv.serialNumber,
                          idx,
                          "priceWithTax",
                          e.target.value
                        )
                      }
                    />
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

export default Products;
