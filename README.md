# AI Resume Analyzer

An AI-powered resume analysis system that compares a candidate's resume with a job description and generates an ATS-style compatibility score and detailed feedback.

The system uses **Ollama + Llama** to intelligently extract technical skills from both the resume and job description. It does not rely on a predefined list of skills.

---

## Overview

The AI Resume Analyzer helps candidates understand how well their resume matches a specific job description.

The application:

- Accepts a PDF resume.
- Extracts text from the resume.
- Uses AI to identify technical skills from the resume.
- Uses AI to identify required technical skills from the job description.
- Compares the extracted skills.
- Calculates an ATS compatibility score.
- Uses AI to generate detailed resume feedback.
- Identifies matching skills and missing skills.
- Provides strengths, weaknesses, and improvement suggestions.

---

## System Architecture

```text
                    ┌──────────────┐
                    │  Resume PDF  │
                    └──────┬───────┘
                           │
                           ▼
                  PDF Text Extraction
                           │
                           ▼
                    ┌──────────────┐
                    │    Ollama    │
                    │    Llama     │
                    └──────┬───────┘
                           │
                           ▼
                AI Resume Skill Extraction
                           │
                           ▼
                  Resume Structured Skills
                           │
                           │
Job Description ───────────┤
                           │
                           ▼
                    ┌──────────────┐
                    │    Ollama    │
                    │    Llama     │
                    └──────┬───────┘
                           │
                           ▼
                 AI Job Skill Extraction
                           │
                           ▼
                    Required Skills
                           │
                           ▼
                   Skill Comparison
                           │
                           ▼
                    ATS Score Calculation
                           │
                           ▼
                  ┌─────────────────┐
                  │   ATS Score      │
                  │      78%         │
                  └─────────────────┘
                           │
                           ▼
                    Ollama Analysis
                           │
                           ▼
              ┌─────────────────────────┐
              │ Strengths               │
              │ Weaknesses              │
              │ Missing Skills          │
              │ Suggestions             │
              └─────────────────────────┘
