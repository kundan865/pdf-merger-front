import './App.css'
import { useState } from "react";
import { Upload, FileText, Trash2, Download } from "lucide-react";
import axios from 'axios';

function App() {

  const [files, setFiles] = useState([]);
  const [mergedBlob, setMergedBlob] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const selected = Array.from(e.target.files);

    setFiles((prev) => [...prev, ...selected]);
    setMergedBlob(null);
  };

  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    setMergedBlob(null);
  };

  async function mergePDFs() {

    if (files.length < 2) {
      alert("Please select at least 2 PDF files.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await axios.post(
        "https://pdf-merger-back.onrender.com/pdf-merger/merge",
        formData,
        {
          responseType: "blob",
        }
      );

      const pdfBlob = await response.blob(
        [response.data],
        {
          type:"application/pdf"
        }
      );

      setMergedBlob(pdfBlob);

    } catch (error) {
      console.error(error);
      alert("Something went wrong while merging PDFs.");
    } finally {
      setLoading(false);
    }
  }
  const downloadPDF = () => {
    if (!mergedBlob) return;

    const url = URL.createObjectURL(mergedBlob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "merged.pdf";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 flex justify-center items-center p-5">

      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-3xl p-6">

        <h1 className="text-3xl font-bold text-center text-blue-700">
          PDF Merger
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Select unlimited PDF files and merge them into one.
        </p>

        <label
          htmlFor="upload"
          className="mt-8 h-60 border-2 border-dashed border-blue-400 rounded-2xl flex flex-col justify-center items-center cursor-pointer hover:bg-blue-50 transition"
        >
          <Upload size={60} className="text-blue-600" />

          <h2 className="text-xl font-semibold mt-4">
            Choose PDF Files
          </h2>

          <p className="text-gray-500">
            Click here to select PDFs
          </p>

          <input
            id="upload"
            type="file"
            multiple
            accept="application/pdf"
            className="hidden"
            onChange={handleChange}
          />
        </label>

        {files.length > 0 && (
          <>
            <div className="mt-8 flex justify-between">
              <h2 className="text-xl font-semibold">
                Selected PDFs
              </h2>

              <span className="bg-blue-100 px-3 py-1 rounded-full text-blue-700">
                {files.length} Files
              </span>
            </div>

            <div className="mt-4 max-h-72 overflow-y-auto space-y-3">

              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-50 border rounded-xl p-4"
                >
                  <div className="flex gap-3 items-center">

                    <FileText className="text-red-500" />

                    <div>
                      <p className="font-semibold break-all">
                        {file.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                  </div>

                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 />
                  </button>
                </div>
              ))}

            </div>

            <button
              onClick={mergePDFs}
              disabled={files.length < 2 || loading}
              className="w-full mt-8 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300"
            >
              {loading ? "Merging..." : "Merge PDFs"}
            </button>

            {mergedBlob && (
              <button
                onClick={downloadPDF}
                className="w-full mt-4 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 flex justify-center items-center gap-2"
              >
                <Download size={20} />
                Download Merged PDF
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
