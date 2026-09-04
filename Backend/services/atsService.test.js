const {
    normalizeSkill,
    compareSkills,
    calculateATSScore,
    calculateDetailedATSScore
} = require("./atsService");

describe("normalizeSkill", () => {
    test("should normalize HTML5 to HTML", () => {
        expect(normalizeSkill("HTML5")).toBe("html");
    });

    test("should normalize CSS3 to CSS", () => {
        expect(normalizeSkill("CSS3")).toBe("css");
    });

    test("should normalize React.js to React", () => {
        expect(normalizeSkill("React.js")).toBe("react");
    });

    test("should normalize ReactJS to React", () => {
        expect(normalizeSkill("ReactJS")).toBe("react");
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

    test("should match common technology variants", () => {
        const resumeSkills = [
            "HTML5",
            "CSS3",
            "React.js"
        ];

        const jobSkills = [
            "HTML",
            "CSS",
            "React"
        ];

        const result = compareSkills(
            resumeSkills,
            jobSkills
        );

        expect(result.matchedSkills).toEqual([
            "HTML5",
            "CSS3",
            "React.js"
        ]);

        expect(result.missingSkills).toEqual([]);
    });

    test("should not infer unrelated skills", () => {
        const resumeSkills = [
            "React",
            "JavaScript"
        ];

        const jobSkills = [
            "Redux",
            "TypeScript"
        ];

        const result = compareSkills(
            resumeSkills,
            jobSkills
        );

        expect(result.matchedSkills).toEqual([]);

        expect(result.missingSkills).toEqual([
            "Redux",
            "TypeScript"
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

describe("calculateDetailedATSScore", () => {
    test("should calculate a detailed ATS score", () => {
        const resumeText = `
            Summary
            Frontend developer

            Experience
            React developer

            Education
            B.Tech

            Skills
            React, JavaScript

            Projects
            Resume Analyzer
        `;

        const jobDescription = `
            React Docker MongoDB
        `;

        const result = calculateDetailedATSScore(
            resumeText,
            jobDescription,
            ["React"],
            ["React", "Docker", "MongoDB"]
        );

        expect(result.skillMatch).toBe(33);
        expect(result.keywordMatch).toBe(33);
        expect(result.structure).toBe(100);
        expect(result.atsScore).toBe(43);
    });

    test("should return 100 when all components are 100", () => {
        const resumeText = `
            Summary
            Frontend developer

            Experience
            React developer

            Education
            B.Tech

            Skills
            React Docker MongoDB

            Projects
            Resume Analyzer
        `;

        const jobDescription = `
            React Docker MongoDB
        `;

        const result = calculateDetailedATSScore(
            resumeText,
            jobDescription,
            ["React", "Docker", "MongoDB"],
            ["React", "Docker", "MongoDB"]
        );

        expect(result.skillMatch).toBe(100);
        expect(result.keywordMatch).toBe(100);
        expect(result.structure).toBe(100);
        expect(result.atsScore).toBe(100);
    });

    test("should not match partial words as keywords", () => {
        const resumeText = `
            JavaScript
            React
        `;

        const jobDescription = `
            Java
            Reactive
        `;

        const result = calculateDetailedATSScore(
            resumeText,
            jobDescription,
            [],
            []
        );

        expect(result.keywordMatch).toBe(0);
    });

    test("should match HTML and CSS technology variants", () => {
        const resumeText = `
            HTML5
            CSS3
        `;

        const jobDescription = `
            HTML
            CSS
        `;

        const result = calculateDetailedATSScore(
            resumeText,
            jobDescription,
            [],
            []
        );

        expect(result.keywordMatch).toBe(100);
    });
});