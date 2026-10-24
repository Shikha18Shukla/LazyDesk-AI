import type { LucideIcon } from 'lucide-react'
import {
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
} from 'lucide-react'
import type { FileKind } from '../types'

export const FILE_KIND_META: Record<
  FileKind,
  { label: string; icon: LucideIcon; tone: string }
> = {
  pdf: { label: 'PDF', icon: FileText, tone: 'rose' },
  image: { label: 'Image', icon: FileImage, tone: 'violet' },
  document: { label: 'Document', icon: FileText, tone: 'blue' },
  spreadsheet: { label: 'Spreadsheet', icon: FileSpreadsheet, tone: 'green' },
  archive: { label: 'Archive', icon: FileArchive, tone: 'amber' },
  audio: { label: 'Audio', icon: FileAudio, tone: 'teal' },
  video: { label: 'Video', icon: FileVideo, tone: 'indigo' },
  code: { label: 'Code', icon: FileCode, tone: 'slate' },
}