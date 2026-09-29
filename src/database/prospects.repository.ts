import { db } from './connection.js'
import type {
  NewProspect,
  Prospect,
  UpdateProspect
} from '../types/prospects.js'

export function getProspects(): Prospect[] {
  const statement = db.prepare(`
    SELECT
      id,
      business_name,
      phone,
      email,
      url,
      message,
      notes,
      created_at,
      updated_at,
      contacted_at
    FROM prospects
    ORDER BY created_at DESC
  `)

  return statement.all() as Prospect[]
}

export function getProspectsByPhone(phone: string): Prospect[] {
  const statement = db.prepare(`
    SELECT
      id,
      business_name,
      phone,
      email,
      url,
      message,
      notes,
      created_at,
      updated_at,
      contacted_at
    FROM prospects
    WHERE phone LIKE ?
    ORDER BY created_at DESC
  `)

  return statement.all(`%${phone}%`) as Prospect[]
}

export function createProspect(data: NewProspect) {
  const statement = db.prepare(`
    INSERT INTO prospects (
      business_name,
      phone,
      email,
      url,
      message,
      notes,
      contacted_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  const result = statement.run(
    data.business_name,
    data.phone,
    data.email ?? null,
    data.url,
    data.message,
    data.notes ?? null,
    data.contacted_at
  )

  return {
    id: Number(result.lastInsertRowid)
  }
}

export function updateProspect(data: UpdateProspect) {
  const statement = db.prepare(`
    UPDATE prospects
    SET
      business_name = ?,
      phone = ?,
      email = ?,
      url = ?,
      message = ?,
      notes = ?,
      contacted_at = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)

  return statement.run(
    data.business_name,
    data.phone,
    data.email ?? null,
    data.url,
    data.message,
    data.notes ?? null,
    data.contacted_at,
    data.id
  )
}

export function deleteProspect(id: number) {
  const statement = db.prepare(`
    DELETE FROM prospects
    WHERE id = ?
  `)

  return statement.run(id)
}