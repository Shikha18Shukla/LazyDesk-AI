<div align="center">

# ✦ LazyDesk AI

### Your files. Your space. Your AI.

**A local-first, AI-powered file organizer that helps you make sense of digital clutter — without sending your files to a hosted AI API.**

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=20232A)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-UI-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Ollama](https://img.shields.io/badge/Ollama-Local_AI-111111?style=for-the-badge)](https://ollama.com/)

*Less searching. Less mess. More focus.*

</div>

---

## 🌌 The idea

Our computers collect PDFs, screenshots, assignments, notes, downloads, images, and files whose names no longer mean anything to us. Finding the right one can become a task of its own.

**LazyDesk AI** combines a focused desktop-style workspace with a local language model to help suggest how a file could be categorized and renamed. It uses Ollama to run AI on your own machine.

> **Local-first by design:** the intended workflow sends file metadata and prompts to your local Ollama service, not a hosted AI API. Review the code and configuration before using it with sensitive information.

## ✨ What it aims to do

- **🗂️ One organized workspace** — explore file-organization ideas through a focused dashboard.
- **🧠 AI-assisted suggestions** — use Gemma 3 through Ollama to suggest a category and clearer filename from file metadata.
- **🔎 File metadata awareness** — use extensions and file sizes to make a folder easier to scan.
- **📊 Dedicated screens** — Overview, File Organizer, Activity, and Settings pages.
- **🔌 Local AI status** — check whether the backend can reach Ollama and whether the configured model is available.
- **🪟 Folder selection** — folder scanning is a work in progress; verify the folder-picker endpoint and UI connection in your current checkout before relying on it.

### Current status

This is an active work in progress. The interface includes sample workspace data, and the backend provides health-check and AI-analysis routes. Not every UI control is necessarily connected end to end yet.

## 🧰 Tech stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + TypeScript | Interactive workspace |
| Build tooling | Vite | Development server and production build |
| Styling | CSS | Dark, violet-accented interface |
| Backend | Python + FastAPI | Local API |
| Validation | Pydantic | Request validation |
| Local inference | Ollama + `gemma3:4b` | AI-powered suggestions |
| HTTP client | `requests` | Connect to local Ollama |

## 🏗️ Project structure

```text
LazyDesk-AI/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .venv/                 # Local environment; not committed
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/        # Shared UI and sidebar
│   │   ├── data/              # Sample workspace data
│   │   ├── hooks/             # Health and workspace hooks
│   │   ├── pages/             # Overview, Organizer, Activity, Settings
│   │   ├── services/          # Frontend API client
│   │   ├── utils/             # Formatting and file-kind helpers
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── .gitignore
└── README.md
```

## 🚀 Get started

### Prerequisites

- Python 3.10 or newer
- Node.js and npm
- Git
- [Ollama](https://ollama.com/download)

### 1. Clone the repository

```bash
git clone https://github.com/Shikha18Shukla/LazyDesk-AI.git
cd LazyDesk-AI
```

### 2. Download the local model

Start Ollama, then run:

```bash
ollama pull gemma3:4b
```

The model takes several gigabytes of disk space. Response speed depends on your computer's hardware and available memory.

### 3. Set up the backend

**Windows PowerShell**

```powershell
py -m venv backend\.venv
.\backend\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r backend\requirements.txt
```

**macOS / Linux**

```bash
python3 -m venv backend/.venv
source backend/.venv/bin/activate
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
```

Start the API from the project root:

```bash
python -m uvicorn main:app --app-dir backend --reload
```

- API base: `http://127.0.0.1:8000`
- Interactive API docs: `http://127.0.0.1:8000/docs`

### 4. Set up the frontend

Open a **second terminal** at the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the exact URL printed by Vite (often `http://localhost:5173`). If that port is busy, Vite may choose another one.

### 5. Confirm local AI connectivity

With Ollama, the backend, and frontend running:

1. Open the frontend URL.
2. Check the Local AI connection indicator.
3. Visit `http://127.0.0.1:8000/docs` and test `GET /api/health`.
4. If the model is offline, verify Ollama is running and `gemma3:4b` is installed.

Useful checks:

```bash
ollama list
ollama run gemma3:4b
```

## 🔌 API overview

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/health` | Checks Ollama connectivity and model availability |
| `POST` | `/api/analyze` | Requests an AI suggestion for file metadata |

Use `/docs` as the source of truth for routes available in your current checkout.

### Example analysis request

```json
{
  "filename": "lecture_notes_final_v3.pdf",
  "extension": ".pdf",
  "size_bytes": 245760
}
```

The endpoint is designed to return the original filename and a structured model suggestion. The exact response fields are defined by `backend/main.py`.

## 🔐 Privacy and safety

- AI inference is intended to run locally through Ollama.
- The analysis request uses file metadata; it does not need the file's contents.
- Review the source code before processing confidential or personal files.
- Scan only folders you deliberately select.
- Review AI suggestions before applying any future bulk rename or move operation.
- Never commit `.env` files, API keys, private documents, or personal data.

## 🧭 Roadmap

- [x] React + TypeScript workspace UI
- [x] FastAPI backend foundation
- [x] Local Ollama health check
- [x] Structured AI analysis endpoint
- [ ] Fully connect folder selection to the UI
- [ ] Approve suggestions before applying changes
- [ ] Safe file move/rename workflow with undo
- [ ] Automated tests and broader error handling
- [ ] Easier desktop packaging

Roadmap checkboxes describe project direction; update them as features become fully implemented and tested.

## 🛠️ Troubleshooting

<details>
<summary><strong>Local AI shows Offline</strong></summary>

1. Confirm Ollama is running.
2. Run `ollama list` and check for `gemma3:4b`.
3. Open `http://127.0.0.1:8000/docs` and test `GET /api/health`.
4. Restart the backend after configuration changes.
</details>

<details>
<summary><strong>The frontend cannot reach the backend</strong></summary>

- Confirm the API is running at `http://127.0.0.1:8000`.
- Check the browser console and backend terminal.
- Ensure FastAPI CORS allows the frontend origin.
- Check `frontend/src/services/api.ts` for the API base URL.
</details>

<details>
<summary><strong>Ollama is slow</strong></summary>

Local inference speed depends on RAM, CPU/GPU, and model size. The first response may take longer while the model loads.
</details>

<details>
<summary><strong>PowerShell activation fails</strong></summary>

You can run the environment's Python directly:

```powershell
.\backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
.\backend\.venv\Scripts\python.exe -m uvicorn main:app --app-dir backend --reload
```
</details>

## 🤝 Contributing

Bug reports, usability ideas, documentation improvements, and pull requests are welcome.

1. Fork the repository.
2. Create a focused branch: `git checkout -b feat/your-improvement`
3. Make and test your change.
4. Commit with a clear message.
5. Open a pull request explaining the problem and solution.

Please do not commit generated files, virtual environments, secrets, or personal data.

## 📜 License

A license has not been specified yet. Until a license file is added, do not assume that the repository grants permission to reuse, modify, or redistribute the code. Add an open-source license before inviting external reuse.

## 💜 Built with curiosity

LazyDesk AI is a learning-in-public project exploring local AI, practical UX, and a calmer relationship with digital clutter.

If you like the idea, ⭐ star the repository, open an issue, or contribute an improvement.

<div align="center">

**Make room for what matters.**

</div>
