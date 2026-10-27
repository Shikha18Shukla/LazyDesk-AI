
import { useState } from 'react'
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  FileText,
  FolderOpen,
  LoaderCircle,
  Sparkles,
} from 'lucide-react'

import { HealthPill, PageHeader } from '../components/ui'
import type { Workspace } from '../hooks/useWorkspace'
import type { HealthResult } from '../types'
import {
  analyzeMemoryFile,
  selectFolder,
  type SelectedFile,
  type MemoryAnalysisResult,
} from '../services/api'
import { formatBytes } from '../utils/format'

interface OrganizerProps {
  workspace: Workspace
  health: HealthResult
}

const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.json', '.csv']

export default function Organizer({
  health,
}: OrganizerProps) {
  const [folder, setFolder] = useState<string | null>(null)
  const [files, setFiles] = useState<SelectedFile[]>([])
  const [selectedFilename, setSelectedFilename] = useState('')
  const [result, setResult] = useState<MemoryAnalysisResult | null>(null)
  const [loadingFolder, setLoadingFolder] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedFile = files.find(
    (file) => file.filename === selectedFilename,
  )

  const isSupported = selectedFile
    ? SUPPORTED_EXTENSIONS.includes(
        selectedFile.extension.toLowerCase(),
      )
    : false

  async function handleChooseFolder() {
    setLoadingFolder(true)
    setError(null)
    setResult(null)

    try {
      const response = await selectFolder()

      if (response.cancelled) {
        return
      }

      setFolder(response.folder)
      setFiles(response.files)
      setSelectedFilename(
        response.files.find((file) =>
          SUPPORTED_EXTENSIONS.includes(
            file.extension.toLowerCase(),
          ),
        )?.filename ?? '',
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not open the folder picker.',
      )
    } finally {
      setLoadingFolder(false)
    }
  }

  async function handleAnalyze() {
    if (!folder || !selectedFile || !isSupported) {
      setError('Choose a supported text file first.')
      return
    }

    setAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const analysis = await analyzeMemoryFile(
        folder,
        selectedFile.filename,
      )
      setResult(analysis)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'File analysis failed.',
      )
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="page">
      <PageHeader
        title="Memory Ghost Organizer"
        subtitle="Select a local folder and use Gemma 3 to understand your text files."
      />

      <section className="card folder-card">
        <span className="icon-chip icon-chip--lg">
          <FolderOpen size={20} />
        </span>

        <div className="folder-card__body">
          <div className="folder-card__title">
            Source folder
          </div>

          <p>
            Choose a folder on your computer. Memory Ghost
            will list its immediate files so you can select
            one for local AI analysis.
          </p>

          <div className="folder-card__path">
            {folder ?? 'No folder selected'}
          </div>

          <p className="muted">
            Supported for analysis: TXT, MD, JSON and CSV.
            Files are limited to 1 MB and the text sent to
            the model is limited to 12,000 characters.
          </p>
        </div>

        <div className="folder-card__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleChooseFolder}
            disabled={loadingFolder || analyzing}
          >
            {loadingFolder ? (
              <LoaderCircle size={15} />
            ) : (
              <FolderOpen size={15} />
            )}
            {loadingFolder ? 'Opening…' : 'Choose folder'}
          </button>
        </div>
      </section>

      <div className="state__meta">
        Local AI <HealthPill state={health.state} />
      </div>

      {error && (
        <div className="banner banner--error" role="alert">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {folder && (
        <section className="card table-card">
          <div className="card__head">
            <h2>Files in folder</h2>
            <span className="sample-tag sample-tag--muted">
              {files.length} files
            </span>
          </div>

          {files.length === 0 ? (
            <div className="state state--inline">
              <FolderOpen size={24} />
              <h3>No files found</h3>
              <p>
                Choose another folder containing files.
              </p>
            </div>
          ) : (
            <div className="memory-file-list">
              {files.map((file) => {
                const supported = SUPPORTED_EXTENSIONS.includes(
                  file.extension.toLowerCase(),
                )

                return (
                  <button
                    type="button"
                    key={file.filename}
                    className={`memory-file-row ${
                      selectedFilename === file.filename
                        ? 'is-focused'
                        : ''
                    }`}
                    onClick={() => {
                      setSelectedFilename(file.filename)
                      setResult(null)
                      setError(null)
                    }}
                  >
                    <FileText size={18} />

                    <span className="memory-file-name">
                      {file.filename}
                      <small>
                        {file.extension || 'No extension'}
                      </small>
                    </span>

                    <span className="muted">
                      {formatBytes(file.size_bytes)}
                    </span>

                    <span
                      className={`status ${
                        supported ? 'status--approved' : 'status--pending'
                      }`}
                    >
                      {supported ? 'Supported' : 'Not supported'}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          <div className="memory-actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleAnalyze}
              disabled={
                !selectedFile ||
                !isSupported ||
                analyzing ||
                loadingFolder
              }
            >
              {analyzing ? (
                <LoaderCircle size={15} />
              ) : (
                <Sparkles size={15} />
              )}
              {analyzing ? 'Analyzing locally…' : 'Analyze selected file'}
            </button>

            {selectedFile && (
              <span className="muted">
                Selected: {selectedFile.filename}
              </span>
            )}
          </div>
        </section>
      )}

      {analyzing && (
        <section className="card state" aria-live="polite">
          <LoaderCircle size={28} />
          <h3>Gemma 3 is analyzing your file</h3>
          <p>
            The local model is preparing a summary, topics,
            key points and memory category. Processing may
            take a little while on your computer.
          </p>
        </section>
      )}

      {result && (
        <section className="card memory-result">
          <div className="card__head">
            <div>
              <h2>
                <BrainCircuit
                  size={20}
                  style={{
                    display: 'inline',
                    verticalAlign: 'middle',
                    marginRight: 8,
                  }}
                />
                Analysis results
              </h2>
              <p className="muted">{result.filename}</p>
            </div>

            <span className="status status--approved">
              <CheckCircle2
                size={13}
                style={{
                  display: 'inline',
                  verticalAlign: 'middle',
                  marginRight: 4,
                }}
              />
              Analyzed
            </span>
          </div>

          <div className="memory-result-section">
            <h3>Summary</h3>
            <p>{result.summary}</p>
          </div>

          <div className="memory-result-section">
            <h3>Memory type</h3>
            <span className="sample-tag">
              {result.memory_type}
            </span>
          </div>

          <div className="memory-result-section">
            <h3>Topics</h3>
            {result.topics.length > 0 ? (
              <div className="memory-tags">
                {result.topics.map((topic, index) => (
                  <span className="sample-tag" key={`${topic}-${index}`}>
                    {topic}
                  </span>
                ))}
              </div>
            ) : (
              <p className="muted">No topics returned.</p>
            )}
          </div>

          <div className="memory-result-section">
            <h3>Key points</h3>
            {result.key_points.length > 0 ? (
              <ul>
                {result.key_points.map((point, index) => (
                  <li key={`${point}-${index}`}>{point}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">No key points returned.</p>
            )}
          </div>

          <div className="banner banner--success">
            <CheckCircle2 size={16} />
            <span>
              {result.processed_locally
                ? 'Processed locally using your configured AI backend.'
                : 'Analysis completed.'}
              {result.truncated
                ? ' The file text was shortened to fit the analysis limit.'
                : ''}
            </span>
          </div>

          <p className="muted">
            This step analyzes the selected file. It does not
            rename, move or delete any files, and it does not
            automatically save the result as a permanent memory.
          </p>
        </section>
      )}
    </div>
  )
}
