import {
  createProspect,
  deleteProspect,
  getProspects,
  getProspectsByPhone,
  updateProspect,
} from '../database/prospects.repository.js'
import type { UpdateProspect, NewProspect } from '../types/prospects.js'

export function getProspectsService() {
  return getProspects()
}

export function getProspectsByPhoneService(phone: string) {
  return getProspectsByPhone(phone)
}

export function createProspectService(data: NewProspect) {
  if (!data) return
  return createProspect(data)
}

export function updateProspectService(data: UpdateProspect) {
  if (!data) return
  return updateProspect(data)
}

export function deleteProspectService(id: number) {
  if (!id) return
  return deleteProspect(id)
}
