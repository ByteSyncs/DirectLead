import { contextBridge, ipcRenderer } from 'electron'
import type { NewProspect, UpdateProspect } from './types/prospects.js'

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
})
