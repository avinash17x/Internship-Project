const {
    extractSkills,
    compareSkills,
    calculateATSScore
} = require("./atsService");

const resumeText = `
Frontend Developer with experience in React,
JavaScript, TypeScript, Tailwind CSS, Git,
REST APIs and GSAP.
`;

const jobDescription = `
We are looking for a Frontend React Developer
with experience in React, TypeScript, Redux,
REST APIs, Git and Jest.
`;

const resumeSkills = extractSkills(resumeText);
const jobSkills = extractSkills(jobDescription);

const result = compareSkills(resumeSkills, jobSkills);

const score = calculateATSScore(
    result.matchedSkills,
    jobSkills
);

console.log("Resume Skills:");
console.log(resumeSkills);

console.log("\nJob Skills:");
console.log(jobSkills);

console.log("\nMatched Skills:");
console.log(result.matchedSkills);

console.log("\nMissing Skills:");
console.log(result.missingSkills);

console.log("\nATS Score:");
console.log(`${score}/100`);