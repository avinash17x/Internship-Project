const axios = require("axios");

const {
    extractSkillsWithAI
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