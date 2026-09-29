import { app, BrowserWindow } from "electron"
import electronUpdater  from 'electron-updater'
import { AppUpdateState } from "../types/updater.js"
import { normalizeReleaseNotes } from "../utils/releaseNotes.js"

const { autoUpdater } = electronUpdater

const updateState: AppUpdateState = {
  status: 'idle',
  currentVersion: app.getVersion(),
  version: null,
  releaseNotes: '',
  percent: 0,
  error: null
}


autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true
autoUpdater.allowPrerelease = false

export function setUpdateState(patch: Partial<AppUpdateState>) {
  Object.assign(updateState, patch)
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send('updates:state', { ...updateState })
  }
}

export async function checkForAppUpdates() {
  if (!app.isPackaged) {
    setUpdateState({ status: 'development', currentVersion: app.getVersion(), error: null })
    return { ...updateState }
  }

  setUpdateState({ status: 'checking', currentVersion: app.getVersion(), error: null })
  try {
    await autoUpdater.checkForUpdates()
  } catch (error) {
    setUpdateState({
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    })
  }
  return { ...updateState }
}

export async function downloadAppUpdate() {
    if (!app.isPackaged || updateState.status !== 'available') {
        return { ...updateState }
    }

    setUpdateState({
        status: 'downloading',
        percent: 0,
        error: null
    })

    try {
        await autoUpdater.downloadUpdate()
    } catch(err) {
        setUpdateState({
            status: 'error',
            error: err instanceof Error ? err.message : String(err)
        })
    }

    return { ...updateState }
}

export function installAppUpdate() {
    if (app.isPackaged && updateState.status === 'downloaded') {
        autoUpdater.quitAndInstall(false, true)
        return true
    }

    return false
}

export function getUpdateState() {
    return { ...updateState }
}

autoUpdater.on('checking-for-update', () => {
  setUpdateState({ status: 'checking', error: null })
})

autoUpdater.on('update-available', (info) => {
  setUpdateState({
    status: 'available',
    currentVersion: app.getVersion(),
    version: info.version,
    releaseNotes: normalizeReleaseNotes(info.releaseNotes),
    percent: 0,
    error: null
  })
})

autoUpdater.on('update-not-available', (info) => {
  setUpdateState({
    status: 'up-to-date',
    currentVersion: app.getVersion(),
    version: info.version,
    releaseNotes: normalizeReleaseNotes(info.releaseNotes),
    percent: 0,
    error: null
  })
})

autoUpdater.on('download-progress', (progress) => {
  setUpdateState({ status: 'downloading', percent: progress.percent, error: null })
})

autoUpdater.on('update-downloaded', (info) => {
  setUpdateState({
    status: 'downloaded',
    currentVersion: app.getVersion(),
    version: info.version,
    releaseNotes: normalizeReleaseNotes(info.releaseNotes),
    percent: 100,
    error: null
  })
})

autoUpdater.on('error', (error) => {
  setUpdateState({ status: 'error', error: error.message })
})
