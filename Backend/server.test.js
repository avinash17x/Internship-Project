const request = require("supertest");
const axios = require("axios");

jest.mock("axios");

jest.mock("pdf-parse", () => ({
    PDFParse: jest.fn()
}));

const app = require("./server");

let consoleErrorSpy;


describe("GET /", () => {
    test("should return backend health message", async () => {
        const response = await request(app)
            .get("/");

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            message: "AI Resume Analyzer Backend is running!"
        });
    });
});

describe("POST /api/ai/test", () => {
    test("should return AI response when Ollama succeeds", async () => {
        axios.post.mockResolvedValue({
            data: {
                response: "An ATS scanner analyzes resumes for relevant skills."
            }
        });

        const response = await request(app)
            .post("/api/ai/test");

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            success: true,
            response: "An ATS scanner analyzes resumes for relevant skills."
        });

        expect(axios.post).toHaveBeenCalled();
    });

    test("should return 500 when Ollama fails", async () => {
        consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => { });

        axios.post.mockRejectedValue(
            new Error("Ollama is unavailable")
        );

        const response = await request(app)
            .post("/api/ai/test");

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            success: false,
            message: "Failed to communicate with Ollama",
            error: "Ollama is unavailable"
        });

        consoleErrorSpy.mockRestore();
    });
});

describe("POST /api/resume/upload", () => {
    test("should return 400 when no resume is uploaded", async () => {
        const response = await request(app)
            .post("/api/resume/upload");

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            message: "No resume uploaded"
        });
    });

    test("should analyze an uploaded resume successfully", async () => {
        const { PDFParse } = require("pdf-parse");

        PDFParse.mockImplementation(() => ({
            getText: jest.fn().mockResolvedValue({
                text: `
                Frontend Developer
                JavaScript
                React
                Git
            `
            }),
            destroy: jest.fn().mockResolvedValue()
        }));

        axios.post.mockResolvedValue({
            data: {
                response: "Resume matches the required frontend skills."
            }
        });

        const response = await request(app)
            .post("/api/resume/upload")
            .field(
                "jobDescription",
                "Looking for JavaScript, React and Git."
            )
            .attach(
                "resume",
                Buffer.from("fake PDF content"),
                "resume.pdf"
            );

        expect(response.statusCode).toBe(200);

        expect(response.body.message).toBe(
            "Resume analyzed successfully"
        );

        expect(response.body.fileName).toBe("resume.pdf");

        expect(response.body.resumeSkills).toEqual([
            "JavaScript",
            "React",
            "Git"
        ]);

        expect(response.body.jobSkills).toEqual([
            "JavaScript",
            "React",
            "Git"
        ]);

        expect(response.body.matchedSkills).toEqual([
            "JavaScript",
            "React",
            "Git"
        ]);

        expect(response.body.missingSkills).toEqual([]);

        expect(response.body.atsScore).toBe(100);

        expect(response.body.analysis).toBe(
            "Resume matches the required frontend skills."
        );
    });

    test("should return 500 when PDF processing fails", async () => {
        consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => { });

        const { PDFParse } = require("pdf-parse");

        PDFParse.mockImplementation(() => ({
            getText: jest.fn().mockRejectedValue(
                new Error("PDF parsing failed")
            ),
            destroy: jest.fn().mockResolvedValue()
        }));

        const response = await request(app)
            .post("/api/resume/upload")
            .field(
                "jobDescription",
                "Looking for JavaScript and React."
            )
            .attach(
                "resume",
                Buffer.from("fake PDF content"),
                "resume.pdf"
            );

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            message: "Failed to process resume",
            error: "PDF parsing failed"
        });

        consoleErrorSpy.mockRestore();
    });
});