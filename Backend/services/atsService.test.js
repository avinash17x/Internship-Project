const {
    compareSkills,
    calculateATSScore
} = require("./atsService");

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

        const result = compareSkills(
            resumeSkills,
            jobSkills
        );

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
            "React"
        ];

        const jobSkills = [
            "JavaScript",
            "React",
            "Python",
            "Docker"
        ];

        const result = calculateATSScore(
            matchedSkills,
            jobSkills
        );

        expect(result).toBe(50);
    });

    test("should return 100 when all skills match", () => {
        const matchedSkills = [
            "JavaScript",
            "React",
            "Git"
        ];

        const jobSkills = [
            "JavaScript",
            "React",
            "Git"
        ];

        const result = calculateATSScore(
            matchedSkills,
            jobSkills
        );

        expect(result).toBe(100);
    });

    test("should return 0 when there are no job skills", () => {
        const result = calculateATSScore(
            [],
            []
        );

        expect(result).toBe(0);
    });
});