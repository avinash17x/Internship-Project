const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const { PDFParse } = require("pdf-parse");
const axios = require("axios");

const {
  compareSkills,
  calculateDetailedATSScore
} = require("./services/atsService");

const {
  extractSkillsWithAI
} = require("./services/aiSkillService");

/**
 * Express application used by the AI Resume Analyzer backend.
 */
const app = express();

app.use(cors());
app.use(express.json());

/**
 * Multer configuration for storing uploaded resume files.
 */
const upload = multer({
  dest: "uploads/",
});

/**
 * Health-check endpoint used to verify that the backend is running.
 *
 * @route GET /
 */
app.get("/", (req, res) => {
  res.json({
    message: "AI Resume Analyzer Backend is running!",
  });
});

/**
 * Uploads and analyzes a resume against a provided job description.
 *
 * @route POST /api/resume/upload
 */
app.post("/api/resume/upload", upload.single("resume"), async (req, res) => {
  try {
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

    const resumeSkills = await extractSkillsWithAI(
      resumeText
    );

    const jobSkills = await extractSkillsWithAI(
      jobDescription || ""
    );

    const skillComparison = compareSkills(
      resumeSkills,
      jobSkills
    );

    const atsResult = calculateDetailedATSScore(
      resumeText,
      jobDescription || "",
      skillComparison.matchedSkills,
      jobSkills
    );

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
      atsScore: atsResult.atsScore,
      atsBreakdown: {
        skillMatch: atsResult.skillMatch,
        keywordMatch: atsResult.keywordMatch,
        structure: atsResult.structure
      },
      resumeSkills: resumeSkills,
      jobSkills: jobSkills,
      matchedSkills: skillComparison.matchedSkills,
      missingSkills: skillComparison.missingSkills,
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

/**
 * Tests communication between the backend and Ollama AI service.
 *
 * @route POST /api/ai/test
 */
app.post("/api/ai/test", async (req, res) => {
  try {
    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3.2:3b",
        prompt: "Explain what an ATS resume scanner does in 3 short points.",
        stream: false
      }
    );

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

/**
 * Port used by the backend server.
 */
const PORT = 5000;

/**
 * Start the server only when this file is executed directly.
 *
 * This allows Jest to import the Express app without
 * starting another server during tests.
 */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;