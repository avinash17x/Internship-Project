const knownSkills = [
    "JavaScript",
    "TypeScript",
    "React",
    "React.js",
    "Redux",
    "HTML",
    "HTML5",
    "CSS",
    "CSS3",
    "Tailwind CSS",
    "Node.js",
    "Express",
    "MongoDB",
    "MySQL",
    "REST APIs",
    "Git",
    "GitHub",
    "Docker",
    "Jest",
    "Cypress",
    "Three.js",
    "GSAP",
    "Python",
    "Java",
    "C++"
];

/**
 * Extracts recognized skills from the provided text.
 *
 * Skills are matched as complete words to prevent partial matches.
 * For example, "JavaScript" should not be detected as "Java".
 *
 * @param {string} text - Resume or job description text.
 * @returns {string[]} List of recognized skills found in the text.
 */
function extractSkills(text) {
    const normalizedText = text.toLowerCase();

    const foundSkills = knownSkills.filter(skill => {
        const skillPattern = new RegExp(
            `\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
            "i"
        );

        return skillPattern.test(normalizedText);
    });

    return [...new Set(foundSkills)];
}

/**
 * Compares the skills found in a resume with the skills
 * required by a job description.
 *
 * @param {string[]} resumeSkills - Skills found in the resume.
 * @param {string[]} jobSkills - Skills required by the job description.
 * @returns {{
 *   matchedSkills: string[],
 *   missingSkills: string[]
 * }} Object containing matched and missing skills.
 */
function compareSkills(resumeSkills, jobSkills) {
    const matchedSkills = jobSkills.filter(skill =>
        resumeSkills.includes(skill)
    );

    const missingSkills = jobSkills.filter(skill =>
        !resumeSkills.includes(skill)
    );

    return {
        matchedSkills,
        missingSkills
    };
}

/**
 * Calculates the ATS match score based on matched skills.
 *
 * The score represents the percentage of required job skills
 * that are also present in the resume.
 *
 * @param {string[]} matchedSkills - Skills present in both the resume and job description.
 * @param {string[]} jobSkills - Skills required by the job description.
 * @returns {number} ATS score from 0 to 100.
 */
function calculateATSScore(matchedSkills, jobSkills) {
    if (jobSkills.length === 0) {
        return 0;
    }

    const score = (matchedSkills.length / jobSkills.length) * 100;

    return Math.round(score);
}

module.exports = {
    extractSkills,
    compareSkills,
    calculateATSScore
};