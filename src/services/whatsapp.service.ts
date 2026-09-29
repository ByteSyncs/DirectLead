import { ipcMain, shell } from 'electron'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const execFileAsync = promisify(execFile)


export async function isWhatsAppDesktopInstalledService() {
    const platform = process.platform

  try {
    if (platform === 'win32') {
      await execFileAsync('reg', ['query', 'HKCR\\whatsapp'])
      return true
    }

    if (platform === 'darwin') {
      const candidates = [
        '/Applications/WhatsApp.app',
        path.join(os.homedir(), 'Applications', 'WhatsApp.app')
      ]

      return candidates.some((candidatePath) => fs.existsSync(candidatePath))
    }

    if (platform === 'linux') {
      const { stdout } = await execFileAsync('xdg-mime', [
        'query',
        'default',
        'x-scheme-handler/whatsapp'
      ])

      return stdout.trim().length > 0
    }
  } catch {
    return false
  }

  return false
}

export async function registerWhatsAppIpcService() {
    ipcMain.handle('whatsapp:isDesktopInstalled', async () => {
    return isWhatsAppDesktopInstalledService()
  })

  ipcMain.handle('open-external', async (_event, url: string) => {
    try {
      await shell.openExternal(url)
      return { ok: true as const }
    } catch (error) {
      return {
        ok: false as const,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  })
}