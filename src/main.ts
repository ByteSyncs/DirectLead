import { app, BrowserWindow, ipcMain } from 'electron'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'

import { initializeDatabase } from './database/migrations.js'
import {
  createProspect,
  deleteProspect,
  getProspects,
  getProspectsByPhone,
  updateProspect
} from './database/prospects.repository.js'
import { registerProspectsIpc } from './ipc/prospects.ipc.js'
import { registerWhatsAppIpc } from './ipc/whatsapp.ipc.js'
import { registerUpdaterIpc } from './ipc/updater.ipc.js'
import { checkForAppUpdates } from './services/updater.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const legalDocuments = {
  privacy: 'privacy.md',
  terms: 'terms.md'
} as const



ipcMain.handle('legal:get', async (_event, documentId: unknown) => {
  if (typeof documentId !== 'string' || !Object.hasOwn(legalDocuments, documentId)) {
    throw new Error('Documento legal no permitido')
  }

  const filename = legalDocuments[documentId as keyof typeof legalDocuments]
  const markdown = await readFile(path.join(__dirname, 'renderer', 'legal', filename), 'utf8')
  return await marked.parse(markdown)
})

ipcMain.handle('window:toggle-fullscreen', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender)
  if (!window) return false
  window.setFullScreen(!window.isFullScreen())
  return window.isFullScreen()
})

ipcMain.handle('app:quit', () => {
  app.quit()
})


let mainWindow: BrowserWindow | null = null


function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 760,
    minHeight: 560,
    autoHideMenuBar: true,
    fullscreenable: true,
    backgroundColor: '#11110f',
    show: false,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.setMenu(null)
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'))

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    if (app.isPackaged) void checkForAppUpdates()
  })
}


app.whenReady().then(() => {
  initializeDatabase()

  registerWhatsAppIpc()
  registerProspectsIpc()
  registerUpdaterIpc()
  
  createWindow()
  

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})