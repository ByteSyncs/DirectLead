import { isWhatsAppDesktopInstalledService, registerWhatsAppIpcService } from "../services/whatsapp.service.js";

async function isWhatsAppDesktopInstalled(): Promise<boolean> {
  return await isWhatsAppDesktopInstalledService()  
}

export function registerWhatsAppIpc() {
  return registerWhatsAppIpcService()
}