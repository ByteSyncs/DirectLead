import { contextBridge, ipcRenderer } from 'electron'
import type { NewProspect, UpdateProspect } from './types/prospects.js'
import type { AppUpdateState } from './types/updater.js'

contextBridge.exposeInMainWorld('api', {
  getProspects: () => ipcRenderer.invoke('prospects:get'),
  getProspectsByPhone: (phone: string) =>
    ipcRenderer.invoke('prospectsByPhone:get', phone),
  createProspect: (data: NewProspect) =>
    ipcRenderer.invoke('prospects:create', data),
  updateProspect: (data: UpdateProspect) =>
    ipcRenderer.invoke('prospects:update', data),
  deleteProspect: (id: number) => ipcRenderer.invoke('prospects:delete', id),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  isWhatsAppDesktopInstalled: () =>
    ipcRenderer.invoke('whatsapp:isDesktopInstalled'),
  getLegalDocument: (documentId: 'privacy' | 'terms') =>
    ipcRenderer.invoke('legal:get', documentId),
  toggleFullscreen: () => ipcRenderer.invoke('window:toggle-fullscreen'),
  quitApp: () => ipcRenderer.invoke('app:quit'),
  getUpdateState: (): Promise<AppUpdateState> => ipcRenderer.invoke('updates:get-state'),
  checkForUpdates: (): Promise<AppUpdateState> => ipcRenderer.invoke('updates:check'),
  downloadUpdate: (): Promise<AppUpdateState> => ipcRenderer.invoke('updates:download'),
  installUpdate: (): Promise<boolean> => ipcRenderer.invoke('updates:install'),
  onUpdateState: (callback: (state: AppUpdateState) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, state: AppUpdateState) => callback(state)
    ipcRenderer.on('updates:state', listener)
    return () => ipcRenderer.removeListener('updates:state', listener)
  },
})
