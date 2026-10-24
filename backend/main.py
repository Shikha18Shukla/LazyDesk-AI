
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import json
from pathlib import Path
import tkinter as tk
from tkinter import filedialog

app = FastAPI(title="LazyDesk AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "gemma3:4b"


class FileInfo(BaseModel):
    filename: str
    extension: str
    size_bytes: int = 0


@app.get("/api/health")
def health():
    try:
        response = requests.get(
            "http://localhost:11434/api/tags", timeout=5
        )
        response.raise_for_status()
        models = response.json().get("models", [])
        available = any(
            model.get("name", "").startswith(MODEL)
            for model in models
        )
        return {
            "status": "ok",
            "ollama": "connected",
            "model_available": available,
        }
    except requests.RequestException:
        return {
            "status": "error",
            "ollama": "not connected",
            "model_available": False,
        }


@app.post("/api/analyze")
def analyze_file(file: FileInfo):
    prompt = f"""
You are LazyDesk AI, a careful file-organizing assistant.
Suggest a category and a clearer filename based only on the
metadata below. Do not claim to know the file's contents.

Filename: {file.filename}
Extension: {file.extension}
Size in bytes: {file.size_bytes}

Choose a category such as Documents, Images, Videos,
Audio, Code, Archives, or Other.

Return only valid JSON with these keys:
category, suggested_filename, reason
Keep the original file extension in the suggested filename.
Do not include folders or paths in the suggested filename.
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "prompt": prompt,
                "stream": False,
                "format": "json",
            },
            timeout=120,
        )
        response.raise_for_status()
        result = response.json().get("response", "")
        suggestion = json.loads(result)

        return {
            "original_filename": file.filename,
            "suggestion": suggestion,
        }

    except requests.RequestException as exc:
        raise HTTPException(
            status_code=503,
            detail="Cannot reach Ollama. Check that Ollama is running.",
        ) from exc
    except (ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(
            status_code=502,
            detail="The AI returned an invalid response. Please retry.",
        ) from exc

@app.post("/api/select-folder")
def select_folder():
    """Open a native Windows folder picker and scan immediate files."""
    root = None

    try:
        root = tk.Tk()
        root.withdraw()
        root.attributes("-topmost", True)

        folder = filedialog.askdirectory(
            parent=root,
            title="Choose a folder for LazyDesk AI"
        )

        root.destroy()
        root = None

        if not folder:
            return {"cancelled": True, "folder": None, "files": []}

        selected = Path(folder).resolve()

        if not selected.is_dir():
            raise HTTPException(
                status_code=400,
                detail="The selected folder does not exist."
            )

        files = []

        # Scan immediate files only; don't enter subfolders.
        for item in selected.iterdir():
            try:
                if item.is_file() and not item.is_symlink():
                    stat = item.stat()
                    files.append({
                        "filename": item.name,
                        "extension": item.suffix.lower(),
                        "size_bytes": stat.st_size,
                    })
            except OSError:
                # Skip files that cannot be accessed.
                continue

        return {
            "cancelled": False,
            "folder": str(selected),
            "files": files,
            "count": len(files),
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not open or scan the selected folder: {exc}"
        ) from exc
    finally:
        if root is not None:
            try:
                root.destroy()
            except Exception:
                pass
