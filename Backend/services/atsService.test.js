const {
    extractSkills,
    compareSkills,
    calculateATSScore
} = require("./atsService");

describe("extractSkills", () => {
    test("should extract skills from resume text", () => {
        const text = `
            Frontend Developer with experience in React,
            JavaScript, TypeScript and Git.
        `;

        const result = extractSkills(text);

        expect(result).toEqual([
            "JavaScript",
            "TypeScript",
            "React",
            "Git"
        ]);
    });

    test("should not detect Java when only JavaScript is present", () => {
        const text = "I have experience in JavaScript and React.";

        const result = extractSkills(text);

        expect(result).toContain("JavaScript");
        expect(result).not.toContain("Java");
    });
});

describe("compareSkills", () => {
    test("should correctly identify matched and missing skills", () => {
        const resumeSkills = [
            "JavaScript",
            "React",
            "Git"
        ];

        const jobSkills = [
            "JavaScript",
            "React",
            "Python",
            "Git"
        ];

        const result = compareSkills(resumeSkills, jobSkills);

        expect(result.matchedSkills).toEqual([
            "JavaScript",
            "React",
            "Git"
        ]);

        expect(result.missingSkills).toEqual([
            "Python"
        ]);
    });
});

describe("calculateATSScore", () => {
    test("should calculate the ATS score correctly", () => {
        const matchedSkills = [
            "JavaScript",
            "React",
            "Git"
        ];

        const jobSkills = [
            "JavaScript",
            "React",
            "Git",
            "Python"
        ];

        const result = calculateATSScore(
            matchedSkills,
            jobSkills
        );

        expect(result).toBe(75);
    });

    test("should return 100 when all skills match", () => {
        const matchedSkills = [
            "JavaScript",
            "React"
        ];

        const jobSkills = [
            "JavaScript",
            "React"
        ];

        const result = calculateATSScore(
            matchedSkills,
            jobSkills
        );

        expect(result).toBe(100);
    });

    test("should return 0 when there are no job skills", () => {
        const matchedSkills = [];

        const jobSkills = [];

        const result = calculateATSScore(
            matchedSkills,
            jobSkills
        );

        expect(result).toBe(0);
    });
});