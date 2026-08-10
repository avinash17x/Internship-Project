const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { PDFParse } = require("pdf-parse");
const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
  dest: "uploads/",
});

app.get("/", (req, res) => {
  res.json({
    message: "AI Resume Analyzer Backend is running!",
  });
});

app.post("/api/resume/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No resume uploaded",
      });
    }

    const fs = require("fs");

    const pdfBuffer = fs.readFileSync(req.file.path);

    const parser = new PDFParse({
      data: pdfBuffer,
    });

    const pdfData = await parser.getText();

    await parser.destroy();

    res.json({
      message: "Resume uploaded successfully",
      fileName: req.file.originalname,
      text: pdfData.text,
    });
  } catch (error) {
    console.error("PDF processing error:", error);

    res.status(500).json({
      message: "Failed to process resume",
      error: error.message,
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});