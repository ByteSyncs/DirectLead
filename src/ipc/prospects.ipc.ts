import { ipcMain, shell } from 'electron'
import {
  createProspectService,
  getProspectsService,
  getProspectsByPhoneService,
  deleteProspectService,
  updateProspectService,
} from '../services/prospects.service.js'

export function registerProspectsIpc() {
  ipcMain.handle('prospects:get', async () => {
    return getProspectsService()
  })

  ipcMain.handle('prospectsByPhone:get', async (_, phone) => {
    return getProspectsByPhoneService(phone)
  })

  ipcMain.handle('prospects:create', async (_, data) => {
    return createProspectService(data)
  })

  ipcMain.handle('prospects:update', async (_, data) => {
    return updateProspectService(data)
  })

  ipcMain.handle('prospects:delete', async (_, id) => {
    return deleteProspectService(id)
  })
}
