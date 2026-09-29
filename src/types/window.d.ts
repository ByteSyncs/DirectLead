import type {
  NewProspect,
  Prospect,
  UpdateProspect
} from './prospects.js'
import type { AppUpdateState } from './updater.js'

declare global {
  interface Window {
    api: {
      getProspects: () => Promise<Prospect[]>
      getProspectsByPhone: (phone: string) => Promise<Prospect[]>
      createProspect: (data: NewProspect) => Promise<{ id: number }>
      updateProspect: (
        data: UpdateProspect
      ) => Promise<unknown>
      deleteProspect: (id: number) => Promise<unknown>
      openExternal: (url: string) => Promise<
        { ok: true } | { ok: false; error: string }
      >
      isWhatsAppDesktopInstalled: () => Promise<boolean>
      getLegalDocument: (documentId: 'privacy' | 'terms') => Promise<string>
      toggleFullscreen: () => Promise<boolean>
      quitApp: () => Promise<void>
      getUpdateState: () => Promise<AppUpdateState>
      checkForUpdates: () => Promise<AppUpdateState>
      downloadUpdate: () => Promise<AppUpdateState>
      installUpdate: () => Promise<boolean>
      onUpdateState: (callback: (state: AppUpdateState) => void) => () => void
    }
  }
}

export {}