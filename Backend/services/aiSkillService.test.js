const axios = require("axios");

const {
  extractSkillsWithAI,
  detectSkillsFromText
} = require("./aiSkillService");

jest.mock("axios");

describe("extractSkillsWithAI", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should extract skills returned by AI", async () => {

        axios.post.mockResolvedValue({
            data: {
                response: JSON.stringify({
                    skills: [
                        "JavaScript",
                        "React",
                        "TypeScript",
                        "Docker"
                    ]
                })
            }
        });

        const text = `
            Frontend developer with experience in
            JavaScript, React, TypeScript and Docker.
        `;

        const result = await extractSkillsWithAI(text);

        expect(result).toEqual([
            "JavaScript",
            "React",
            "TypeScript",
            "Docker"
        ]);

        expect(axios.post).toHaveBeenCalled();
    });

    test("should return an empty array when text is empty", async () => {

        const result = await extractSkillsWithAI("");

        expect(result).toEqual([]);

        expect(axios.post).not.toHaveBeenCalled();
    });

    test("should remove duplicate skills", async () => {

        axios.post.mockResolvedValue({
            data: {
                response: JSON.stringify({
                    skills: [
                        "JavaScript",
                        "React",
                        "JavaScript"
                    ]
                })
            }
        });

        const result = await extractSkillsWithAI(
            "JavaScript and React"
        );

        expect(result).toEqual([
            "JavaScript",
            "React"
        ]);
    });

    test("should return empty array when AI returns invalid skills data", async () => {

        axios.post.mockResolvedValue({
            data: {
                response: JSON.stringify({
                    skills: "JavaScript"
                })
            }
        });

        const result = await extractSkillsWithAI(
            "JavaScript"
        );

        expect(result).toEqual([]);
    });

});

test("detects explicitly mentioned technical skills from text", () => {
  const text = `
    Frontend developer with experience in JavaScript,
    TypeScript, React, HTML5, CSS3, Tailwind CSS,
    Git, Docker, Node.js and MongoDB.
  `;

  const skills = detectSkillsFromText(text);

  expect(skills).toEqual([
    "JavaScript",
    "TypeScript",
    "React",
    "HTML",
    "CSS",
    "Tailwind CSS",
    "Git",
    "Docker",
    "Node.js",
    "MongoDB"
  ]);
});