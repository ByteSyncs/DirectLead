import { ipcMain } from 'electron'

import {
  checkForAppUpdates,
  downloadAppUpdate,
  getUpdateState,
  installAppUpdate
} from '../services/updater.service.js'

export function registerUpdaterIpc() {
  ipcMain.handle('updates:get-state', () => {
    return getUpdateState()
  })

  ipcMain.handle('updates:check', () => {
    return checkForAppUpdates()
  })

  ipcMain.handle('updates:download', () => {
    return downloadAppUpdate()
  })

  ipcMain.handle('updates:install', () => {
    return installAppUpdate()
  })
}