import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1115] via-[#121826] to-[#0f1115] flex items-center">
      <div className="max-w-4xl mx-auto px-6 w-full">
        
        <div className="bg-[#141821] border border-gray-800 rounded-2xl shadow-xl p-10">
          
          <h1 className="text-3xl md:text-4xl font-semibold text-white leading-snug">
            Automated Data Extraction
            <br />
            <span className="text-teal-400">
              & Invoice Management
            </span>
          </h1>
          
          <p className="mt-4 text-gray-400 text-lg max-w-2xl">
            A streamlined tool to extract, organize, and manage invoice data
            from PDFs, images, and spreadsheets using AI.
          </p>
          
          <div className="mt-8">
            <button
              onClick={() => navigate("/workspace")}
              className="px-7 py-3 rounded-lg bg-teal-600 text-white font-medium text-base
                         hover:bg-teal-500 transition shadow-md"
            >
              Go to Workspace
            </button>
          </div>
          
          <div className="my-10 border-t border-gray-700" />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-400">
            <div>
              <span className="font-medium text-gray-200">
                AI Extraction
              </span>
              <p className="mt-1">
                Automatically reads invoice data accurately.
              </p>
            </div>

            <div>
              <span className="font-medium text-gray-200">
                Multi-Format
              </span>
              <p className="mt-1">
                Supports PDF, images, Excel, and CSV.
              </p>
            </div>

            <div>
              <span className="font-medium text-gray-200">
                Structured Output
              </span>
              <p className="mt-1">
                Clean separation of invoices, products, and customers.
              </p>
            </div>
          </div>

        </div>
        
        <div className="text-center text-gray-500 text-sm mt-6">
          Designed for efficient document processing and data workflows
        </div>

      </div>
    </div>
  );
}

export default Home;
