import { useRef, useState } from "react";
import axios from "axios";

function App() {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please select a PDF file.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError("");
    setResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a resume PDF first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const formData = new FormData();

      formData.append("resume", selectedFile);
      formData.append("jobDescription", jobDescription);

      const response = await axios.post(
        "http://localhost:5000/api/resume/upload",
        formData
      );

      setResult(response.data);

      console.log("Resume analysis:", response.data);
    } catch (error) {
      console.error("Upload error:", error);

      setError(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to analyze resume."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <h1 className="text-xl font-bold">
            AI Resume Analyzer
          </h1>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-16">

        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4">
            Analyze Your Resume
          </h2>

          <p className="text-slate-400 text-lg">
            Get AI-powered feedback before you apply.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">

          {/* Upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center cursor-pointer hover:border-slate-500 transition"
          >
            <div className="text-5xl mb-4">
              📄
            </div>

            <h3 className="text-xl font-semibold mb-2">
              {selectedFile
                ? selectedFile.name
                : "Upload your resume"}
            </h3>

            <p className="text-slate-400 mb-6">
              PDF files only
            </p>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="bg-white text-slate-950 px-6 py-3 rounded-lg font-semibold hover:bg-slate-200 transition"
            >
              Choose PDF
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Job Description */}
          <div className="mt-8">

            <label className="block text-sm font-medium mb-2">
              Job Description
              <span className="text-slate-500 ml-2">
                Optional
              </span>
            </label>

            <textarea
              value={jobDescription}
              onChange={(event) =>
                setJobDescription(event.target.value)
              }
              placeholder="Paste the job description here..."
              className="w-full h-40 bg-slate-900 border border-slate-800 rounded-xl p-4 outline-none focus:border-slate-600 resize-none"
            />

          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              {error}
            </div>
          )}

          {/* Analyze */}
          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 py-4 rounded-xl font-semibold transition"
          >
            {loading ? "Analyzing Resume..." : "Analyze Resume"}
          </button>

          {/* Results */}
          {result && (
            <div className="mt-12 space-y-8">

              {/* ATS Score */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
                <p className="text-slate-400 mb-2">
                  ATS Score
                </p>

                <div className="text-6xl font-bold text-blue-400">
                  {result.atsScore}%
                </div>
              </div>

              {/* Skills */}
              <div className="grid md:grid-cols-2 gap-6">

                {/* Resume Skills */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Resume Skills
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {result.resumeSkills?.length > 0 ? (
                      result.resumeSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-2 bg-slate-800 rounded-lg text-sm"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-500">
                        No skills detected.
                      </p>
                    )}
                  </div>
                </div>

                {/* Job Skills */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Required Skills
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {result.jobSkills?.length > 0 ? (
                      result.jobSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-2 bg-slate-800 rounded-lg text-sm"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-500">
                        No job skills detected.
                      </p>
                    )}
                  </div>
                </div>

              </div>

              {/* Matching Skills */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Matching Skills
                </h3>

                <div className="flex flex-wrap gap-2">
                  {result.matchedSkills?.length > 0 ? (
                    result.matchedSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-500">
                      No matching skills found.
                    </p>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Missing Skills
                </h3>

                <div className="flex flex-wrap gap-2">
                  {result.missingSkills?.length > 0 ? (
                    result.missingSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-green-400">
                      No missing skills.
                    </p>
                  )}
                </div>
              </div>

              {/* AI Analysis */}
              {result.analysis && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    AI Analysis
                  </h3>

                  <div className="whitespace-pre-wrap text-slate-300 leading-7">
                    {result.analysis}
                  </div>
                </div>
              )}

              {/* Extracted Text */}
              {result.text && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Extracted Resume Text
                  </h3>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-slate-300">
                      {result.text}
                    </pre>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </main>

    </div>
  );
}

export default App;
