import { useState } from "react";
import { useSelector } from "react-redux";

import Invoices from "../components/Invoice.jsx";
import Products from "../components/Products.jsx";
import Customers from "../components/Customer.jsx";
import UploadSection from "../components/UploadSection.jsx";

const Workspace = () => {
  const [activeView, setActiveView] = useState("invoices");
  const invoices = useSelector((state) => state.invoices);

  const views = {
    invoices: { label: "Invoices", component: Invoices },
    products: { label: "Products", component: Products },
    customers: { label: "Customers", component: Customers },
  };

  const ActiveComponent = views[activeView].component;

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-white">
            Workspace
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Automated Data Extraction and Invoice Management
          </p>
        </header>
        
        <div className="mb-8 rounded-xl border border-gray-800 bg-[#141821] p-6">
          <UploadSection />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <aside className="rounded-xl border border-gray-800 bg-[#141821] p-4 h-fit">
            <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">
              Data Views
            </p>

            <div className="space-y-1">
              {Object.entries(views).map(([key, item]) => {
                const isActive = key === activeView;

                return (
                  <button
                    key={key}
                    onClick={() => setActiveView(key)}
                    className={`w-full text-left px-4 py-2 rounded-md text-sm transition
                      ${
                        isActive
                          ? "bg-teal-600 text-white"
                          : "text-gray-400 hover:bg-[#1b2030] hover:text-teal-200"
                      }
                    `}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </aside>
          
          <main className="md:col-span-3 rounded-xl border border-gray-800 bg-[#141821] p-6 min-h-[420px]">
            {invoices?.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-gray-500">
                Upload documents to view extracted data
              </div>
            ) : (
              <ActiveComponent />
            )}
          </main>

        </div>
      </div>
    </div>
  );
};

export default Workspace;
