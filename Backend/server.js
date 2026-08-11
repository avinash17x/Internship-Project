const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const { PDFParse } = require("pdf-parse"); // Text extraction in pdf
const axios = require("axios");

const app = express(); // Creates a server

app.use(cors()); // Allows the frontend and backend to communicate when they're running on different origins/ports.
app.use(express.json());

const upload = multer({ // Handles the file upload from the frontend/Postman
  dest: "uploads/",
});

app.get("/", (req, res) => { // Health check -> Checks if backend is alive
  res.json({
    message: "AI Resume Analyzer Backend is running!",
  });
});


// API to upload a pdf
app.post("/api/resume/upload", upload.single("resume"), async (req, res) => {
  try {
    // req.file -> Uploaded file 
    if (!req.file) {
      return res.status(400).json({
        message: "No resume uploaded"
      });
    }

    const { jobDescription } = req.body;

    const dataBuffer = fs.readFileSync(req.file.path);

    const parser = new PDFParse({
      data: dataBuffer
    });

    const result = await parser.getText();

    const resumeText = result.text;

    await parser.destroy();

    const prompt = `
You are a strict ATS resume analyzer.

Your job is to compare ONLY the information explicitly present in the resume
against the information explicitly required in the job description.

====================
STRICT RULES
====================

1. NEVER invent information.

2. NEVER assume a skill from a related skill.
   Example:
   React does NOT imply Redux.
   REST APIs does NOT imply API testing.
   JavaScript does NOT imply TypeScript.
   TypeScript does NOT imply advanced TypeScript.

3. Only report a skill as present if it is explicitly written in the resume.

4. Preserve proficiency levels exactly.
   Example:
   "TypeScript (basic)" must be reported as "TypeScript (basic)".

5. If a required skill is not explicitly present in the resume,
   mark it as "Not mentioned".

6. Do NOT claim that a missing skill is something the candidate has.

7. Do NOT recommend adding a skill unless you clearly say:
   "Add this only if you genuinely have the experience."

8. Do NOT recommend certifications unless the job description explicitly
   requires them.

9. Do NOT recommend specific tools such as Jest, Enzyme, Redux, etc.
   unless those tools appear in the job description or resume.

10. Do NOT infer proficiency from project complexity.

11. Do NOT infer experience from job titles.

12. Do NOT infer testing experience from Git or REST API experience.

13. Do NOT infer Redux experience from React experience.

14. Do NOT infer advanced TypeScript knowledge from TypeScript (basic).

====================
RESUME
====================

${resumeText}

====================
JOB DESCRIPTION
====================

${jobDescription || "No job description provided."}

====================
ANALYSIS
====================

Provide:

1. Overall assessment
2. Matching skills
3. Missing skills
4. Strengths
5. Weaknesses
6. Specific improvement suggestions

For MATCHING SKILLS:
Only include skills explicitly present in both the resume and job description.

For MISSING SKILLS:
Only include skills explicitly required by the job description but not explicitly
mentioned in the resume.

For STRENGTHS:
Use only evidence from the resume.

For WEAKNESSES:
Only identify gaps that can be supported by comparing the resume and job description.

For SUGGESTIONS:
Make suggestions actionable, but never assume the candidate has a missing skill.
If recommending that a missing skill be added to the resume, say:
"Add this only if you genuinely have the experience."

Do not add information that is not present in the resume or job description.
`;

    const aiResponse = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3.2:3b",
        prompt: prompt,
        stream: false
      }
    );

    res.json({
      message: "Resume analyzed successfully",
      fileName: req.file.originalname,
      text: resumeText,
      analysis: aiResponse.data.response
    });

  } catch (error) {
    console.error("Resume processing error:", error);

    res.status(500).json({
      message: "Failed to process resume",
      error: error.message
    });
  }
});

const PORT = 5000;

app.post("/api/ai/test", async (req, res) => {
  try {
    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3.2:3b",
      prompt: "Explain what an ATS resume scanner does in 3 short points.",
      stream: false
    });

    res.json({
      success: true,
      response: response.data.response
    });

  } catch (error) {
    console.error("Ollama error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to communicate with Ollama",
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});