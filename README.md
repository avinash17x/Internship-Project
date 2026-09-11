# ATSense — AI Resume Analyzer

> An AI-powered resume analysis platform that evaluates resumes against job descriptions, calculates an ATS compatibility score, identifies matching and missing skills, and provides actionable AI-generated feedback.

---

## Overview

**ATSense** is a full-stack AI Resume Analyzer built to help job seekers understand how well their resume matches a specific job description.

The application combines deterministic resume analysis with local AI processing to provide:

- ATS compatibility scoring
- Resume skill extraction
- Job-description skill extraction
- Matching skill detection
- Missing skill detection
- Resume structure analysis
- Keyword matching
- AI-generated strengths and weaknesses
- Actionable resume suggestions

The AI processing runs locally using **Ollama and Llama 3.2 3B**, avoiding dependency on paid cloud AI APIs.

---

## Screenshots

### Resume Upload

Upload a PDF resume and provide the target job description.

![Resume Upload](screenshot/Home.png)

### ATS Score & Skill Matching

The analyzer generates an ATS score and clearly separates matching and missing skills.

![ATS Analysis](screenshot/analysis-result.png)

### AI-Powered Resume Analysis

The system generates a detailed analysis covering strengths, weaknesses, and suggestions.

![AI Analysis](screenshot/ai-analysis.png)

---

## Key Features

### Resume Processing

- PDF resume upload
- PDF text extraction
- PDF-only file validation
- Automatic resume content analysis

### AI-Powered Skill Extraction

- Extracts technical skills from resumes
- Extracts required skills from job descriptions
- Uses local LLM processing through Ollama
- Prevents unsupported skill inference
- Handles duplicate skills

### Skill Matching

The system compares resume skills against job requirements using normalized skill names.

Examples:

```text
React.js  → React
ReactJS   → React
HTML5     → HTML
CSS3      → CSS
NodeJS    → Node.js
Mongo DB  → MongoDB

```
---

## How to Run

Follow the steps below to run ATSense on a Windows computer.

### Prerequisites

Make sure the following software is installed:

- Git
- Node.js 20 or later
- Docker Desktop
- Ollama

Verify the installations:

```powershell
git --version
node --version
docker --version
ollama --version
