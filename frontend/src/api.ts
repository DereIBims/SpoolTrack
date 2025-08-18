import axios from 'axios'
const DEFAULT_API_BASE = '/api'

export const API = axios.create({ baseURL: DEFAULT_API_BASE })

export type Product = {
  id: number
  name: string
  manufacturer: string
  material?: string
  color_name: string
  color_hex: string
  nominal_net_g: number
  stock_unopened: number
}

export type Spool = {
  id: string
  product_id: number
  created_at: string
  net_start_g: number
  gross_start_g: number
  tare_g: number
  net_current_g: number
}
