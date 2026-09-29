import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'node:path'

const dbPath = path.join(app.getPath('userData'), 'directlead.db')

export const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
