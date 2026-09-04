import { useRef, useState } from "react";
import axios from "axios";

/* ---------- Score Ring ---------- */

function ScoreRing({ value = 0, size = 168, stroke = 14 }) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div
      className="relative rounded-full flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(#5B6EF5 ${
          pct * 3.6
        }deg, #262b4f ${pct * 3.6}deg)`,
      }}
    >
      <div
        className="absolute rounded-full bg-[#12142c] flex flex-col items-center justify-center"
        style={{
          width: size - stroke * 2,
          height: size - stroke * 2,
        }}
      >
        <span className="text-4xl font-bold text-white">
          {pct}%
        </span>
      </div>
    </div>
  );
}

/* ---------- Mini Ring ---------- */

function MiniRing({ value = 0, label }) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: 84,
          height: 84,
          background: `conic-gradient(#5B6EF5 ${
            pct * 3.6
          }deg, #262b4f ${pct * 3.6}deg)`,
        }}
      >
        <div className="absolute w-16 h-16 rounded-full bg-[#1c2044] flex items-center justify-center">
          <span className="text-sm font-semibold text-white">
            {pct}%
          </span>
        </div>
      </div>

      <span className="text-xs text-[#9aa3d1] text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

/* ---------- Main App ---------- */

function App() {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState("");

  /* ---------- File Selection ---------- */

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
    setAnalysisResult(null);
  };

  /* ---------- Upload / Analyze ---------- */

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a resume PDF first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnalysisResult(null);

      const formData = new FormData();

      formData.append("resume", selectedFile);
      formData.append("jobDescription", jobDescription);

      const response = await axios.post(
        "http://localhost:5000/api/resume/upload",
        formData
      );

      setAnalysisResult(response.data);
    } catch (error) {
      console.error("Upload error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to analyze resume."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Score Label ---------- */

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent match";
    if (score >= 60) return "Good match";
    if (score >= 40) return "Moderate match";
    return "Needs improvement";
  };

  /* ---------- AI Analysis Formatting ---------- */

  const formatAnalysis = (analysis) => {
    if (!analysis) return null;

    const sections = analysis.split(
      /={3,}\s*([A-Z ]+?)\s*={3,}/
    );

    const result = [];

    for (let i = 1; i < sections.length; i += 2) {
      const title = sections[i]?.trim();
      const content = sections[i + 1]?.trim();

      if (title && content) {
        result.push({
          title,
          content,
        });
      }
    }

    if (result.length > 0) {
      return result;
    }

    return [
      {
        title: "AI Analysis",
        content: analysis,
      },
    ];
  };

  return (
    <div className="min-h-screen bg-[#12142c] text-white relative overflow-hidden">

      {/* Background Glow */}

      <div className="pointer-events-none absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-[#3d4a8c]/30 blur-3xl" />

      <div className="pointer-events-none absolute top-1/3 -left-32 w-[360px] h-[360px] rounded-full bg-[#5B6EF5]/10 blur-3xl" />

      {/* Navbar */}

      <nav className="relative border-b border-[#242a52] bg-[#12142c]/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="px-6 h-12 rounded-xl bg-[#5B6EF5] flex items-center justify-center text-md font-bold">
              ATSense
            </div>

            <h1 className="text-lg font-bold tracking-tight">
              ATS Resume Analyzer
            </h1>

          </div>

          <span className="hidden sm:inline-block text-xs font-medium text-[#9aa3d1] bg-[#1c2044] border border-[#2a2f5c] px-3 py-1.5 rounded-full">
            AI-powered feedback
          </span>

        </div>
      </nav>

      {/* Main */}

      <main className="relative max-w-6xl mx-auto px-6 py-12">

        {/* Hero */}

        <div className="min-h-[400px] rounded-3xl bg-gradient-to-br from-[#3444c3] to-[#7C8CF0] p-8 md:p-10 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">

          <div className="relative z-10 max-w-3xl">

            <h2 className="text-5xl md:text-7xl font-bold mb-3 leading-tight">
              Optimize your resume for the exact ATS
            </h2>

            <p className="text-white/80 text-lg max-w-lg pt-7">
              Upload a PDF, paste the job description, and get a
              clear ATS score with matched and missing skills in
              seconds.
            </p>

          </div>

          <div className="w-60 h-40 flex items-center justify-center rounded-xl text-9xl relative z-10">
            🔍
          </div>

          <div className="pointer-events-none absolute -bottom-16 -right-10 w-56 h-56 rounded-full bg-white/10" />

        </div>

        {/* Upload Section */}

        <div className="max-w-3xl mx-auto">

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#2a2f5c] hover:border-[#5B6EF5] rounded-2xl p-10 text-center cursor-pointer transition bg-[#1c2044]/60"
          >

            <div className="text-5xl mb-4">
              📥
            </div>

            <h3 className="text-xl font-semibold mb-2">
              {selectedFile
                ? selectedFile.name
                : "Upload your resume"}
            </h3>

            <p className="text-[#9aa3d1] mb-6">
              PDF files only
            </p>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="bg-white text-[#12142c] px-6 py-3 rounded-lg font-semibold hover:bg-[#e4e6f9] transition"
            >
              Choose PDF
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />

          </div>

          {/* Job Description */}

          <div className="mt-8">

            <label className="block text-md font-medium mb-2">
              Job description
            </label>

            <textarea
              value={jobDescription}
              onChange={(event) =>
                setJobDescription(event.target.value)
              }
              placeholder="Paste the job description here..."
              className="w-full h-40 bg-[#1c2044] border border-[#2a2f5c] rounded-xl p-4 outline-none focus:border-[#5B6EF5] resize-none placeholder:text-[#5c6494]"
            />

          </div>

          {/* Error */}

          {error && (
            <div className="mt-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
              {error}
            </div>
          )}

          {/* Analyze Button */}

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full mt-6 bg-[#5B6EF5] hover:bg-[#6c7cf7] disabled:bg-[#2a2f5c] disabled:text-[#6b74a8] py-4 rounded-xl font-semibold transition"
          >
            {loading
              ? "Analyzing resume..."
              : "Analyze resume"}
          </button>

        </div>

        {/* Results */}

        {analysisResult && (
          <div className="mt-16 space-y-8">

            {/* ATS Score */}

            <section className="max-w-3xl mx-auto bg-[#1c2044] border border-[#242a52] rounded-2xl p-8 flex flex-col items-center">

              <p className="text-[#9aa3d1] uppercase tracking-wider text-sm font-semibold mb-6">
                ATS Score
              </p>

              <ScoreRing
                value={analysisResult.atsScore}
              />

              <p className="text-[#9aa3d1] mt-5">
                {getScoreLabel(
                  analysisResult.atsScore
                )}
              </p>

            </section>

            {/* Skill Overview */}

            <section className="grid md:grid-cols-2 gap-6">

              {/* Resume Skills */}

              <div className="bg-[#1c2044] border border-[#242a52] rounded-2xl p-6">

                <h3 className="text-xl font-semibold mb-5">
                  Resume skills
                </h3>

                <div className="flex flex-wrap gap-2">

                  {analysisResult.resumeSkills?.map(
                    (skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="px-3 py-2 rounded-lg bg-[#262c53] text-[#c7cbf0] text-sm"
                      >
                        {skill}
                      </span>
                    )
                  )}

                </div>

              </div>

              {/* Required Skills */}

              <div className="bg-[#1c2044] border border-[#242a52] rounded-2xl p-6">

                <h3 className="text-xl font-semibold mb-5">
                  Required skills
                </h3>

                <div className="flex flex-wrap gap-2">

                  {analysisResult.jobSkills?.map(
                    (skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="px-3 py-2 rounded-lg bg-[#262c53] text-[#c7cbf0] text-sm"
                      >
                        {skill}
                      </span>
                    )
                  )}

                </div>

              </div>

            </section>

            {/* Matching / Missing Skills */}

            <section className="grid md:grid-cols-2 gap-6">

              {/* Matching */}

              <div className="bg-[#1c2044] border border-[#242a52] rounded-2xl p-6">

                <h3 className="text-xl font-semibold mb-5">
                  Matching skills
                </h3>

                {analysisResult.matchedSkills?.length > 0 ? (
                  <div className="space-y-3">

                    {analysisResult.matchedSkills.map(
                      (skill, index) => (
                        <div
                          key={`${skill}-${index}`}
                          className="flex items-center gap-3 text-[#c7cbf0] bg-[#171b3a] border-l-2 border-emerald-400 rounded-lg px-3 py-2"
                        >
                          <span className="text-emerald-400">
                            ✓
                          </span>

                          {skill}
                        </div>
                      )
                    )}

                  </div>
                ) : (
                  <p className="text-[#6b74a8]">
                    No matching skills found.
                  </p>
                )}

              </div>

              {/* Missing */}

              <div className="bg-[#1c2044] border border-[#242a52] rounded-2xl p-6">

                <h3 className="text-xl font-semibold mb-5">
                  Missing skills
                </h3>

                {analysisResult.missingSkills?.length > 0 ? (
                  <div className="space-y-3">

                    {analysisResult.missingSkills.map(
                      (skill, index) => (
                        <div
                          key={`${skill}-${index}`}
                          className="flex items-center gap-3 text-[#c7cbf0] bg-[#171b3a] border-l-2 border-rose-400 rounded-lg px-3 py-2"
                        >
                          <span className="text-rose-400">
                            ✕
                          </span>

                          {skill}
                        </div>
                      )
                    )}

                  </div>
                ) : (
                  <p className="text-[#6b74a8]">
                    No missing skills.
                  </p>
                )}

              </div>

            </section>

            {/* Match Breakdown */}

            {analysisResult.jobSkills?.length > 0 && (
              <section className="bg-[#1c2044] border border-[#242a52] rounded-2xl p-8">

                <h3 className="text-xl font-semibold mb-6">
                  Match breakdown
                </h3>

                <div className="flex flex-wrap gap-10 justify-center">

                  <MiniRing
                    value={
                      analysisResult.atsBreakdown?.skillMatch ??
                      Math.round(
                        ((analysisResult.matchedSkills?.length || 0) /
                          (analysisResult.jobSkills?.length || 1)) *
                          100
                      )
                    }
                    label="Skill Match"
                  />

                  <MiniRing
                    value={
                      analysisResult.atsBreakdown?.keywordMatch ?? 0
                    }
                    label="Keyword Match"
                  />

                  <MiniRing
                    value={
                      analysisResult.atsBreakdown?.structure ?? 0
                    }
                    label="Resume Structure"
                  />

                </div>

                {/* Score explanation */}

                <div className="mt-8 text-center text-sm text-[#8c93c4] leading-6">
                  <p>
                    Overall ATS score is calculated using:
                  </p>

                  <p className="mt-1">
                    60% Skill Match + 25% Keyword Match + 15% Resume Structure
                  </p>
                </div>

              </section>
            )}

            {/* AI Analysis */}

            <section className="bg-[#1c2044] border border-[#242a52] rounded-2xl p-8">

              <h3 className="text-2xl font-semibold mb-8">
                AI analysis
              </h3>

              <div className="space-y-8">

                {formatAnalysis(
                  analysisResult.analysis
                )?.map((section, index) => (

                  <div key={index}>

                    <h4 className="text-lg font-semibold mb-3 text-[#c7cbf0]">
                      {section.title
                        .toLowerCase()
                        .replace(/\b\w/g, (char) =>
                          char.toUpperCase()
                        )}
                    </h4>

                    <div className="text-[#b3b9e0] leading-7 whitespace-pre-line">
                      {section.content}
                    </div>

                  </div>

                ))}

              </div>

            </section>

            {/* Extracted Resume Text */}

            <section className="bg-[#1c2044] border border-[#242a52] rounded-2xl p-8">

              <h3 className="text-xl font-semibold mb-5">
                Extracted resume text
              </h3>

              <div className="bg-[#12142c] border border-[#242a52] rounded-xl p-6 max-h-96 overflow-y-auto">

                <pre className="whitespace-pre-wrap text-sm text-[#8c93c4] leading-6">
                  {analysisResult.text}
                </pre>

              </div>

            </section>

          </div>
        )}

      </main>

    </div>
  );
}

export default App;