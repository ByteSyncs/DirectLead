export interface Prospect {
  id: number
  business_name: string
  phone: string
  email: string | null
  url: string
  message: string
  notes: string | null
  created_at: string
  updated_at: string
  contacted_at: string
}

export type NewProspect = {
  business_name: string
  phone: string
  email?: string
  url: string
  message: string
  notes?: string
  contacted_at: string
}

export type UpdateProspect = {
  id: number
  business_name: string
  phone: string
  email?: string
  url: string
  message: string
  notes?: string
  contacted_at: string
}