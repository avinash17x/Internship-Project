/**
 * Normalizes skill names so common variations can match.
 *
 * Examples:
 * React.js -> react
 * ReactJS -> react
 * JavaScript (ES6+) -> javascript
 * TailwindCSS -> tailwind css
 */
function normalizeSkill(skill) {
    if (typeof skill !== "string") {
        return "";
    }

    let normalized = skill
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    const aliases = {
        "html5": "html",
        "css3": "css",

        "react.js": "react",
        "reactjs": "react",
        "react js": "react",

        "node.js": "node.js",
        "nodejs": "node.js",
        "node js": "node.js",

        "javascript (es6+)": "javascript",
        "javascript(es6+)": "javascript",
        "javascript es6+": "javascript",
        "javascript es6": "javascript",
        "js": "javascript",

        "typescript (basic)": "typescript",
        "ts": "typescript",

        "tailwindcss": "tailwind css",
        "tailwind": "tailwind css",

        "mongodb": "mongodb",
        "mongo db": "mongodb",

        "express.js": "express",
        "expressjs": "express",
        "express js": "express"
    };

    return aliases[normalized] || normalized;
}

/**
 * Compares resume skills with job-description skills.
 *
 * Matching is deterministic and does not use AI.
 */
function compareSkills(resumeSkills, jobSkills) {
    if (!Array.isArray(resumeSkills) || !Array.isArray(jobSkills)) {
        return {
            matchedSkills: [],
            missingSkills: []
        };
    }

    const resumeSkillMap = new Map();

    for (const skill of resumeSkills) {
        if (typeof skill !== "string") continue;

        const normalized = normalizeSkill(skill);

        if (normalized && !resumeSkillMap.has(normalized)) {
            resumeSkillMap.set(normalized, skill.trim());
        }
    }

    const matchedSkills = [];
    const missingSkills = [];
    const matchedNormalized = new Set();
    const missingNormalized = new Set();

    for (const jobSkill of jobSkills) {
        if (typeof jobSkill !== "string") continue;

        const originalSkill = jobSkill.trim();
        const normalizedJobSkill = normalizeSkill(originalSkill);

        if (!normalizedJobSkill) continue;

        if (resumeSkillMap.has(normalizedJobSkill)) {
            if (!matchedNormalized.has(normalizedJobSkill)) {
                matchedSkills.push(
                    resumeSkillMap.get(normalizedJobSkill)
                );

                matchedNormalized.add(normalizedJobSkill);
            }
        } else {
            if (!missingNormalized.has(normalizedJobSkill)) {
                missingSkills.push(originalSkill);
                missingNormalized.add(normalizedJobSkill);
            }
        }
    }

    return {
        matchedSkills,
        missingSkills
    };
}

/**
 * Calculates deterministic ATS skill-match score.
 *
 * Formula:
 *
 * matched required skills
 * ----------------------- × 100
 * total required skills
 *
 * @returns {number} Score from 0 to 100.
 */
function calculateATSScore(matchedSkills, jobSkills) {
    if (!Array.isArray(jobSkills) || jobSkills.length === 0) {
        return 0;
    }

    if (!Array.isArray(matchedSkills)) {
        return 0;
    }

    const uniqueJobSkills = new Set();

    for (const skill of jobSkills) {
        const normalized = normalizeSkill(skill);

        if (normalized) {
            uniqueJobSkills.add(normalized);
        }
    }

    if (uniqueJobSkills.size === 0) {
        return 0;
    }

    const uniqueMatchedSkills = new Set();

    for (const skill of matchedSkills) {
        const normalized = normalizeSkill(skill);

        if (normalized && uniqueJobSkills.has(normalized)) {
            uniqueMatchedSkills.add(normalized);
        }
    }

    return Math.round(
        (uniqueMatchedSkills.size / uniqueJobSkills.size) * 100
    );
}

/**
 * Calculates a detailed deterministic ATS score.
 *
 * Components:
 * - Skill Match: 60%
 * - Keyword Match: 25%
 * - Resume Structure: 15%
 */
function calculateDetailedATSScore(
    resumeText,
    jobDescription,
    matchedSkills,
    jobSkills
) {
    const skillScore = calculateATSScore(
        matchedSkills,
        jobSkills
    );

    const resume = typeof resumeText === "string"
        ? resumeText.toLowerCase()
        : "";

    const job = typeof jobDescription === "string"
        ? jobDescription.toLowerCase()
        : "";

    /*
     * Keyword matching
     *
     * Uses important words from the job description.
     * Very common English words are ignored.
     */
    const stopWords = new Set([
        "the", "and", "or", "with", "for", "from",
        "this", "that", "are", "you", "your",
        "our", "will", "have", "has", "had",
        "who", "what", "when", "where", "how",
        "into", "about", "their", "they", "them",
        "using", "use", "work", "working",
        "years", "year", "experience", "required",
        "requirements", "skills", "ability",
        "role", "job", "candidate", "team"
    ]);

    const jobWords = job
        .replace(/[^a-z0-9+#.\s-]/gi, " ")
        .split(/\s+/)
        .map(word => word.trim())
        .filter(word =>
            word.length >= 3 &&
            !stopWords.has(word)
        );

    const uniqueJobWords = [...new Set(jobWords)];

    let matchedKeywords = 0;

    for (const keyword of uniqueJobWords) {
        const normalizedKeyword = normalizeSkill(keyword);

        if (!normalizedKeyword) {
            continue;
        }

        let keywordMatches = false;

        // Check exact/whole-word match first
        const escapedKeyword = normalizedKeyword.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        const wholeWordRegex = new RegExp(
            `(?<![a-z0-9])${escapedKeyword}(?![a-z0-9])`,
            "i"
        );

        if (wholeWordRegex.test(resume)) {
            keywordMatches = true;
        }

        // Handle technology variants such as HTML5 -> HTML and CSS3 -> CSS
        if (!keywordMatches) {
            const resumeWords = resume
                .split(/\s+/)
                .map(word => word.replace(/[^a-z0-9+#.]/gi, ""))
                .filter(Boolean);

            for (const resumeWord of resumeWords) {
                if (normalizeSkill(resumeWord) === normalizedKeyword) {
                    keywordMatches = true;
                    break;
                }
            }
        }

        if (keywordMatches) {
            matchedKeywords++;
        }
    }

    const keywordScore = uniqueJobWords.length > 0
        ? Math.round(
            (matchedKeywords / uniqueJobWords.length) * 100
        )
        : 0;

    /*
     * Resume structure score
     *
     * Checks for common resume sections.
     */
    const sections = [
        /\b(summary|objective|profile)\b/i,
        /\bexperience\b/i,
        /\beducation\b/i,
        /\bskills\b/i,
        /\bprojects?\b/i
    ];

    const sectionsFound = sections.filter(
        section => section.test(resumeText || "")
    ).length;

    const structureScore = Math.round(
        (sectionsFound / sections.length) * 100
    );

    const atsScore = Math.round(
        skillScore * 0.60 +
        keywordScore * 0.25 +
        structureScore * 0.15
    );

    return {
        atsScore,
        skillMatch: skillScore,
        keywordMatch: keywordScore,
        structure: structureScore
    };
}

module.exports = {
    normalizeSkill,
    compareSkills,
    calculateATSScore,
    calculateDetailedATSScore
};