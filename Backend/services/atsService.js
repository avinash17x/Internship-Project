/**
 * Compares skills extracted by AI from a resume
 * with skills extracted by AI from a job description.
 *
 * No predefined skill list is used.
 * The comparison works with whatever skills are returned
 * by the AI extraction service.
 *
 * @param {string[]} resumeSkills - Skills extracted from the resume.
 * @param {string[]} jobSkills - Skills extracted from the job description.
 * @returns {{
 *   matchedSkills: string[],
 *   missingSkills: string[]
 * }} Object containing matched and missing skills.
 */
function compareSkills(resumeSkills, jobSkills) {
    const normalizedResumeSkills = resumeSkills.map(skill =>
        skill.trim().toLowerCase()
    );

    const matchedSkills = [];
    const missingSkills = [];

    for (const jobSkill of jobSkills) {
        const normalizedJobSkill = jobSkill.trim().toLowerCase();

        const matchIndex = normalizedResumeSkills.indexOf(
            normalizedJobSkill
        );

        if (matchIndex !== -1) {
            matchedSkills.push(resumeSkills[matchIndex]);
        } else {
            missingSkills.push(jobSkill);
        }
    }

    return {
        matchedSkills: [...new Set(matchedSkills)],
        missingSkills: [...new Set(missingSkills)]
    };
}

/**
 * Calculates the ATS match score based on matched skills.
 *
 * The score represents the percentage of required job skills
 * that are also present in the resume.
 *
 * The calculation is deterministic and does not use AI.
 *
 * @param {string[]} matchedSkills - Skills found in both the resume
 * and job description.
 * @param {string[]} jobSkills - Skills required by the job description.
 * @returns {number} ATS score from 0 to 100.
 */
function calculateATSScore(matchedSkills, jobSkills) {
    if (!Array.isArray(jobSkills) || jobSkills.length === 0) {
        return 0;
    }

    if (!Array.isArray(matchedSkills)) {
        return 0;
    }

    const uniqueJobSkills = [
        ...new Set(
            jobSkills
                .map(skill => skill.trim().toLowerCase())
                .filter(Boolean)
        )
    ];

    const uniqueMatchedSkills = [
        ...new Set(
            matchedSkills
                .map(skill => skill.trim().toLowerCase())
                .filter(Boolean)
        )
    ];

    const matchedCount = uniqueMatchedSkills.filter(skill =>
        uniqueJobSkills.includes(skill)
    ).length;

    const score =
        (matchedCount / uniqueJobSkills.length) * 100;

    return Math.round(score);
}

module.exports = {
    compareSkills,
    calculateATSScore
};