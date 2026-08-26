const axios = require("axios");

/**
 * Extracts skills from text using Ollama AI.
 *
 * No predefined skill list is used.
 * The AI identifies skills directly from the supplied text.
 *
 * @param {string} text - Resume or job description text.
 * @returns {Promise<string[]>} Extracted skills.
 */
async function extractSkillsWithAI(text) {
    if (!text || !text.trim()) {
        return [];
    }

    const prompt = `
You are an expert resume and job-description skill extraction system.

Extract ONLY skills explicitly mentioned in the text.

Skills may include:
- Programming languages
- Frameworks
- Libraries
- Databases
- Cloud technologies
- DevOps tools
- Testing tools
- Software tools
- Platforms
- Technical methodologies
- Technical competencies

STRICT RULES:

1. NEVER invent a skill.
2. NEVER infer a skill.
3. Only extract skills explicitly mentioned.
4. Do not assume one technology implies another.
5. Do not extract job titles.
6. Do not extract company names.
7. Do not extract degrees or education.
8. Do not extract personal characteristics.
9. Do not extract generic words such as "development",
   "experience", "communication", or "teamwork".
10. Preserve recognizable technology names.
11. Remove duplicate skills.
12. Return ONLY valid JSON.
13. Do not return markdown.
14. Do not return explanations.

The response MUST use exactly this format:

{
    "skills": [
        "Skill 1",
        "Skill 2",
        "Skill 3"
    ]
}

TEXT:

${text}
`;

    try {
        const response = await axios.post(
            "http://localhost:11434/api/generate",
            {
                model: "llama3.2:3b",
                prompt,
                stream: false
            }
        );

        const rawResponse = response?.data?.response;

        if (typeof rawResponse !== "string") {
            return [];
        }

        let cleanedResponse = rawResponse.trim();

        // Remove markdown code fences if the model adds them.
        cleanedResponse = cleanedResponse
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        let parsed;

        try {
            parsed = JSON.parse(cleanedResponse);
        } catch (error) {
            // Try to extract the JSON object if the AI added extra text.
            const startIndex = cleanedResponse.indexOf("{");
            const endIndex = cleanedResponse.lastIndexOf("}");

            if (startIndex === -1 || endIndex === -1) {
                return [];
            }

            const jsonObject = cleanedResponse.slice(
                startIndex,
                endIndex + 1
            );

            try {
                parsed = JSON.parse(jsonObject);
            } catch (error) {
                return [];
            }
        }

        // The expected AI response must contain a skills array.
        if (!parsed || !Array.isArray(parsed.skills)) {
            return [];
        }

        const skills = parsed.skills
            .filter(skill => typeof skill === "string")
            .map(skill => skill.trim())
            .filter(Boolean);

        return [...new Set(skills)];

    } catch (error) {
        throw error;
    }
}

module.exports = {
    extractSkillsWithAI
};