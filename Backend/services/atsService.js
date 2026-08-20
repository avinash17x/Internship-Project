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