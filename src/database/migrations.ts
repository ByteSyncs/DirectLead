import { db } from './connection.js'

export function initializeDatabase() {
  db.exec(`
        CREATE TABLE IF NOT EXISTS prospects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          business_name TEXT,
          phone TEXT NOT NULL,
          email TEXT,
          url TEXT,
          message TEXT NOT NULL,
          notes TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          contacted_at TEXT NOT NULL
        )
    `)

  const columns = db.prepare('PRAGMA table_info(prospects)').all() as Array<{ name: string }>
  if (!columns.some((column) => column.name === 'email')) {
    db.exec('ALTER TABLE prospects ADD COLUMN email TEXT')
  }
}
