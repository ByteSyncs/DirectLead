export type AppUpdateStatus =
  | 'idle'
  | 'checking'
  | 'up-to-date'
  | 'available'
  | 'downloading'
  | 'downloaded'
  | 'error'
  | 'development'

export interface AppUpdateState {
  status: AppUpdateStatus
  currentVersion: string
  version: string | null
  releaseNotes: string
  percent: number
  error: string | null
}