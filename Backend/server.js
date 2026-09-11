const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const { PDFParse } = require("pdf-parse");
const axios = require("axios");

const {
  normalizeSkill,
  compareSkills,
  calculateDetailedATSScore
} = require("./services/atsService");

const {
  extractSkillsWithAI,
  detectSkillsFromText
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
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  }
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
  let uploadedFilePath;

  try {
    uploadedFilePath = req.file?.path;

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

    const aiResumeSkills = await extractSkillsWithAI(resumeText);
    const detectedResumeSkills = detectSkillsFromText(resumeText);

    const aiJobSkills = await extractSkillsWithAI(jobDescription);
    const detectedJobSkills = detectSkillsFromText(jobDescription);

    function uniqueSkillsByNormalization(skills) {
      const seen = new Set();

      return skills.filter((skill) => {
        if (typeof skill !== "string") {
          return false;
        }

        const trimmedSkill = skill.trim();

        if (!trimmedSkill) {
          return false;
        }

        const normalizedSkill = normalizeSkill(trimmedSkill);

        if (!normalizedSkill || seen.has(normalizedSkill)) {
          return false;
        }

        seen.add(normalizedSkill);
        return true;
      });
    }

    const resumeSkills = uniqueSkillsByNormalization([
      ...aiResumeSkills,
      ...detectedResumeSkills
    ]);

    const jobSkills = uniqueSkillsByNormalization([
      ...aiJobSkills,
      ...detectedJobSkills
    ]);

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

You are a strict ATS resume analysis assistant.

The backend has already calculated the ATS score and compared the resume
skills with the job requirements.

The backend results are the SINGLE SOURCE OF TRUTH.

====================
BACKEND RESULTS
====================

Resume Skills:
${JSON.stringify(resumeSkills)}

Job Required Skills:
${JSON.stringify(jobSkills)}

Matched Skills:
${JSON.stringify(skillComparison.matchedSkills)}

Missing Skills:
${JSON.stringify(skillComparison.missingSkills)}

ATS Score:
${atsResult.atsScore}

Skill Match Score:
${atsResult.skillMatch}

Keyword Match Score:
${atsResult.keywordMatch}

Structure Score:
${atsResult.structure}

====================
ABSOLUTE RULES
====================

1. NEVER invent a skill, technology, framework, library, tool,
   certification, requirement, experience, achievement, or qualification.

2. Matching Skills MUST contain ONLY skills from the backend
   Matched Skills list.

3. Missing Skills MUST contain ONLY skills from the backend
   Missing Skills list.

4. NEVER move a skill between Matching Skills and Missing Skills.

5. NEVER claim the candidate has a missing skill.

6. NEVER evaluate the candidate against a requirement that is not present
   in the backend Job Required Skills list.

7. NEVER mention unrelated technologies when discussing weaknesses,
   suggestions, or job fit.

8. Do not infer one skill from another.

   React does NOT imply Redux.
   JavaScript does NOT imply TypeScript.
   TypeScript does NOT imply advanced TypeScript.
   Git does NOT imply Docker.
   REST APIs do NOT imply API testing.

9. Preserve proficiency levels exactly as provided.

10. Do not invent work experience, responsibilities, achievements,
    certifications, education, or technical experience.

11. Strengths must be supported directly by the resume.

12. Weaknesses MUST be based ONLY on skills in the backend
    Missing Skills list.

13. Suggestions MUST address ONLY skills in the backend
    Missing Skills list or actual resume improvements directly related
    to the job requirements.

14. NEVER mention a technology unless it is relevant to the specific
    section and supported by the backend results or resume.

15. If there are missing skills, do not claim the candidate should add
    them unless the candidate genuinely has that experience.

16. Whenever recommending that a missing skill be added to the resume,
    use this EXACT sentence:

    "Add this only if you genuinely have the experience."

17. Do not recommend learning, adding, or using a technology that is NOT
    present in the backend Job Required Skills list.

18. The ATS score and all individual scores MUST be reported exactly
    as provided by the backend.

19. Do not recalculate, reinterpret, or modify any backend score.

20. Do not explain what the individual ATS sub-scores mathematically mean.

====================
RESUME
====================

${resumeText}

====================
JOB DESCRIPTION
====================

${jobDescription || "No job description provided."}

====================
REQUIRED OUTPUT
====================

Provide EXACTLY these six sections and no additional sections:

**Overall Assessment**

Briefly explain how well the resume matches the job requirements.

Mention the ATS score and the three backend sub-scores exactly as provided:

- Skill Match Score
- Keyword Match Score
- Structure Score

Do not reinterpret or recalculate these scores.

**Matching Skills**

List ONLY skills from the backend Matched Skills list.

**Missing Skills**

List ONLY skills from the backend Missing Skills list.

If there are no missing skills, say exactly:

"No major skill gaps identified."

**Strengths**

List 3 to 5 strengths supported directly by the resume.

Do not introduce unrelated job requirements.

Do not invent experience or achievements.

**Weaknesses**

Discuss ONLY skills from the backend Missing Skills list.

Do not mention any other technology, skill, requirement, or weakness.

If there are no missing skills, say exactly:

"No major weaknesses identified based on the provided job requirements."

**Suggestions**

Give practical resume improvement suggestions based ONLY on the
backend Missing Skills list and the actual job requirements.

If there are missing skills:

- Create EXACTLY one bullet for each item in the backend Missing Skills list.
- Use the exact missing skill name from the backend Missing Skills list.
- Do not add unrelated technologies.
- Do not recommend courses, workshops, tutorials, or learning resources.
- Do not tell the candidate to learn the skill.
- Do not claim the candidate has experience with the skill.
- Do not suggest adding the skill unless the candidate genuinely has
  that experience.
- If suggesting that the skill be added to the resume, use this EXACT
  sentence:

"Add this only if you genuinely have the experience."

- Do not change, shorten, or paraphrase that sentence.
- Do not add any other recommendation for that missing skill.
- Do not say:
  "No additional skill-related suggestions are necessary."

If there are no missing skills, say exactly:

"No additional skill-related suggestions are necessary."

====================
FINAL VALIDATION
====================

Before producing the answer, perform all of the following checks:

CHECK 1:
Every Matching Skill exists in the backend Matched Skills list.

CHECK 2:
Every Missing Skill exists in the backend Missing Skills list.

CHECK 3:
Matching Skills and Missing Skills do not overlap.

CHECK 4:
Weaknesses mention ONLY backend Missing Skills.

CHECK 5:
Suggestions mention ONLY actual job requirements and actual gaps.

CHECK 6:
Do not introduce unrelated technologies.

CHECK 7:
Do not claim the candidate has a missing skill.

CHECK 8:
Do not change the ATS score.

CHECK 9:
Do not change any ATS sub-score.

CHECK 10:
The response contains EXACTLY these six sections:
Overall Assessment
Matching Skills
Missing Skills
Strengths
Weaknesses
Suggestions

CHECK 11:
If Missing Skills contains one or more skills, Suggestions must contain
exactly one bullet for each missing skill.

CHECK 12:
If Missing Skills is empty, Suggestions must contain exactly:
"No additional skill-related suggestions are necessary."

CHECK 13:
The sentence
"Add this only if you genuinely have the experience."
must NEVER be paraphrased.

If any statement violates these rules, remove or rewrite it before
producing the final answer.

`;

    const aiResponse = await axios.post(
      `${process.env.OLLAMA_URL || "http://localhost:11434"}/api/generate`,
      {
        model: "llama3.2:3b",
        prompt: prompt,
        stream: false
      }
    );

    // Generate deterministic suggestions from backend missing skills.
    // Do not allow the AI to invent or add extra suggestions.
    const deterministicSuggestions =
      skillComparison.missingSkills.length > 0
        ? skillComparison.missingSkills
          .map(
            (skill) =>
              `- ${skill}: Add this only if you genuinely have the experience.`
          )
          .join("\n")
        : "No additional skill-related suggestions are necessary.";

    // Replace the AI-generated Suggestions section with the
    // backend-controlled deterministic version.
    let finalAnalysis = aiResponse.data.response;

    const suggestionsHeading = "**Suggestions**";

    if (finalAnalysis.includes(suggestionsHeading)) {
      finalAnalysis =
        finalAnalysis.split(suggestionsHeading)[0] +
        suggestionsHeading +
        "\n\n" +
        deterministicSuggestions;
    } else {
      finalAnalysis +=
        `\n\n${suggestionsHeading}\n\n${deterministicSuggestions}`;
    }

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
      analysis: finalAnalysis
    });

  } catch (error) {
    console.error("Resume processing error:", error);

    res.status(500).json({
      message: "Failed to process resume",
      error: error.message
    });
  } finally {
    if (uploadedFilePath) {
      try {
        await fs.promises.unlink(uploadedFilePath);
      } catch (cleanupError) {
        console.error(
          "Failed to delete uploaded resume:",
          cleanupError.message
        );
      }
    }
  }
});

app.use((error, req, res, next) => {
  if (error.message === "Only PDF files are allowed") {
    return res.status(400).json({
      message: error.message
    });
  }

  console.error("Unhandled server error:", error);

  res.status(500).json({
    message: "Internal server error"
  });
});

/**
 * Tests communication between the backend and Ollama AI service.
 *
 * @route POST /api/ai/test
 */
app.post("/api/ai/test", async (req, res) => {
  try {
    const response = await axios.post(
      `${process.env.OLLAMA_URL || "http://localhost:11434"}/api/generate`,
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