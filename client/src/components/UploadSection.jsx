import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setInvoices } from "../features/invoicesSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UploadSection = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
  ];

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    const validFiles = files.filter((file) =>
      allowedTypes.includes(file.type)
    );

    if (!validFiles.length) {
      toast.error("Unsupported file format");
      return;
    }

    // ✅ replace previous selection with new selection
    setSelectedFiles(validFiles);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      toast.warning("Please select files to upload");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    try {
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_ENDPOINT}/api/extract`,
        formData
      );

      dispatch(setInvoices(response.data?.data?.invoices || []));
      toast.success("Invoices extracted successfully");

      // ❌ DO NOT clear selectedFiles here
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to process files"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mb-10">
      {loading && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-[#020617] border border-gray-700 rounded-xl p-6 text-center w-[340px]">
            <div className="h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-300 text-sm">
              Analyzing documents and extracting data…
            </p>
          </div>
        </div>
      )}

      <div className="bg-[#020617] border border-gray-700 rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-teal-400">
            Upload Invoices
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Upload documents to automatically extract invoice data
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <label className="relative">
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <span className="inline-flex items-center px-4 py-2 rounded-lg
                             bg-teal-600 hover:bg-teal-500 text-black
                             font-medium cursor-pointer transition">
              Add Files
            </span>
          </label>

          <button
            onClick={handleUpload}
            disabled={!selectedFiles.length || loading}
            className="px-4 py-2 rounded-lg border border-teal-600
                       text-teal-400 hover:bg-teal-600 hover:text-black
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition"
          >
            Upload & Process
          </button>

          <span className="text-sm text-gray-400">
            {selectedFiles.length
              ? `${selectedFiles.length} file(s) selected`
              : "No files added"}
          </span>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-6 space-y-2">
            <p className="text-sm font-medium text-gray-300">
              Selected Files
            </p>

            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center
                           bg-black/40 border border-gray-700
                           rounded-lg px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-gray-200 text-sm">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <button
                  onClick={() => removeFile(idx)}
                  className="text-xs text-red-400 hover:text-red-300 transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default UploadSection;
