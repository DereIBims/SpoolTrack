import React, { useEffect, useState } from 'react'
import { API, Product, Spool } from '../api'
import { openLabelAsPng } from '../utils/printLabel'

export default function NewSpoolForm({ onCreated }: { onCreated: (s: Spool) => void }) {
  const [products, setProducts] = useState<Product[]>([])
  const defaultForm = { product_id: 0, gross_start_g: undefined as number | undefined, net_start_g: undefined as number | undefined, label_note: '' }
  const [form, setForm] = useState(defaultForm)

  useEffect(() => { API.get<Product[]>('/api/products').then(r => setProducts(r.data)) }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
	const payload = { ...form }
	if (payload.net_start_g === undefined) payload.net_start_g = 1000
	const { data } = await API.post<Spool>('/api/spools', payload)
	
	setForm(defaultForm)
	onCreated(data)
	
	// Direkt Label drucken
	await openLabelAsPng(data.id)
  }

  return (
    <form className="card grid" onSubmit={submit}>
      <h3>Neue Rolle</h3>
      <div className="grid cols-2">
        <label>
          Produkt
          <select value={form.product_id} onChange={e => setForm({ ...form, product_id: +e.target.value })} required>
            <option value={0}>Produkt wählen…</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.manufacturer} {p.name} · {p.color_name}</option>)}
          </select>
        </label>
        <label>
          Bruttogewicht (g)
          <input
            type="number"
            placeholder="z. B. 1200"
            value={form.gross_start_g ?? ''}
            onChange={e => setForm({ ...form, gross_start_g: e.target.value ? +e.target.value : undefined })}
          />
        </label>
        <label>
          Nettogewicht (g)
          <input
            type="number"
            placeholder="Standard 1000"
            value={form.net_start_g ?? ''}
            onChange={e => setForm({ ...form, net_start_g: e.target.value ? +e.target.value : undefined })}
          />
        </label>
        <label>
          Label-Notiz
          <input
            placeholder="Optional"
            value={form.label_note}
            onChange={e => setForm({ ...form, label_note: e.target.value })}
          />
        </label>
      </div>
      <button>Anlegen</button>
    </form>
  )
}
