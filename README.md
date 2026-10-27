# 👻 Memory Ghost

### Give your forgotten files a second life.

**Memory Ghost is a local-first AI memory assistant that turns scattered text files into useful summaries, key points, and topics using Gemma 3 through Ollama.**

Instead of manually rereading old notes, study materials, and documents, select a folder, choose a supported file, and let your local AI help you rediscover what's inside.

> 🧠 Your files hold memories. Memory Ghost helps bring them back.

## ✨ Features

- 📂 **Choose a folder** — use the native folder picker to browse your files.
- 🧠 **AI-powered file analysis** — generate summaries with locally running Gemma 3.
- 🔑 **Extract key points** — identify important information from supported text files.
- 🏷️ **Discover topics** — see the main subjects discussed in a file.
- 👻 **Classify memories** — receive an AI-generated memory category.
- 🔒 **Local-first inference** — run analysis through Ollama on your own computer rather than a hosted AI API.
- 🎨 **Focused interface** — use a modern, dark-themed workspace designed to make file exploration easier.

## 🎃 Why Memory Ghost?

Our computers accumulate lecture notes, project documents, personal writing, research, and forgotten files. Often, the information is still useful—we simply can't remember where it is or what it contains.

Memory Ghost explores how open-weight AI can help people rediscover that information without depending on a third-party hosted AI service.

The goal is simple: make forgotten digital information easier to revisit, understand, and use.

## 🛠️ Technology stack

| Component | Technology |
|---|---|
| Frontend | React, TypeScript |
| Build tool | Vite |
| Styling | CSS |
| Backend | Python, FastAPI |
| Local AI runtime | Ollama |
| AI model | Gemma 3 (`gemma3:4b`) |
| Memory database foundation | SQLite |

## ⚙️ How it works

1. **Select a folder:** choose the directory containing your files.
2. **Choose a file:** select a supported text-based file from the displayed list.
3. **Analyze locally:** the FastAPI backend reads the file and sends its text to Gemma 3 through your local Ollama service.
4. **Explore the results:** review the generated summary, topics, key points, and memory category.

### Supported file formats

- `.txt`
- `.md`
- `.json`
- `.csv`

The current analysis endpoint accepts files up to 1 MB and limits the text sent for analysis to 12,000 characters. Longer content may be truncated.

**Current scope:** Memory Ghost analyzes selected files and displays AI-generated results. Persistent saving and retrieval of analyzed memories, automatic file organization, and desktop packaging are future improvements.

## 🔐 Privacy and responsible AI

Memory Ghost is designed around local inference:

- AI requests are sent to your locally running Ollama service.
- The application does not require a hosted AI API key for its core analysis workflow.
- File content is read by the backend for analysis; this is different from a metadata-only workflow.
- AI-generated summaries and classifications may contain mistakes. Review the results before relying on them.
- Only select files you intend to analyze, especially when they contain personal or confidential information.

Local inference reduces reliance on external AI services, but it does not by itself guarantee complete device or data security. Your computer, installed software, and local configuration still matter.

## 🚀 Getting started

### Prerequisites

Install the following:

- Python 3.10 or newer
- Node.js and npm
- Git
- [Ollama](https://ollama.com/download)

### 1. Download the project

```bash
git clone https://github.com/Shikha18Shukla/LazyDesk-AI.git
cd LazyDesk-AI
```

This repository currently contains the Memory Ghost adaptation.

### 2. Download Gemma 3

Start Ollama, then run:

```bash
ollama pull gemma3:4b
```

Confirm that the model is available:

```bash
ollama list
```

### 3. Set up the Python backend

From the project root, create and activate a virtual environment if you don't already have one:

**Windows PowerShell**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
```

Start the backend:

```powershell
python -m uvicorn main:app --app-dir backend --reload
```

The API runs at:

- API documentation: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/api/health

### 4. Set up the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

http://localhost:5173

### 5. Run Memory Ghost

Make sure Ollama is running, the Gemma 3 model is installed, and both the backend and frontend are active.

Then select a folder, choose a supported file, and run the AI analysis.

## 🗺️ Roadmap

- [x] React and TypeScript interface
- [x] FastAPI backend
- [x] Local Ollama connectivity
- [x] Native folder selection
- [x] AI-powered file summaries
- [x] Topic extraction and key-point generation
- [x] Memory classification
- [x] Initial SQLite database foundation
- [ ] Persist analyzed memories in SQLite
- [ ] Browse and search previously saved memories
- [ ] Add memory deletion and management controls
- [ ] Improve automated testing and error handling
- [ ] Package the application as a desktop app

## 🌱 Why open-source AI matters

Open-weight models make it possible for developers to experiment, build, and learn without relying exclusively on proprietary hosted AI APIs.

With Gemma 3 and Ollama, Memory Ghost demonstrates how local inference can support a practical application: understanding and rediscovering information stored on your own computer.

Open innovation also gives developers the opportunity to inspect implementations, adapt ideas, share improvements, and build tools around their own needs. Model licenses and the licenses of reused code still need to be respected.

## 👩‍💻 Project information

**Project:** Memory Ghost  
**Created by:** Shikha Shukla  
**AI model:** Gemma 3 (`gemma3:4b`)  
**Runtime:** Ollama  
**Backend:** FastAPI  
**Frontend:** React + TypeScript

### Acknowledgment

Memory Ghost was developed by adapting the existing [LazyDesk-AI repository](https://github.com/Shikha18Shukla/LazyDesk-AI). The Memory Ghost-specific interface and file-analysis workflow build on that codebase.

The upstream repository currently states that no license has been specified. This acknowledgment is not a substitute for permission to redistribute code. The licensing and attribution requirements for the reused code must be resolved before redistributing it as a separate project.

---

*Bringing forgotten files back to life, one memory at a time. 👻*
