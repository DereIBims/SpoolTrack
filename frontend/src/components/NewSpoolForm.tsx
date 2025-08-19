import React, { useState } from 'react'
import { API, Product, Spool } from '../api'
import { openLabelAsPng } from '../utils/printLabel'
import { t } from '../i18n-rt'

// Diese Version erhält die Produktliste als Prop von App.tsx.
// Sobald in NewProductForm ein neues Produkt erstellt wurde und App.refresh() läuft,
// wird die Liste hier automatisch neu gerendert – kein Reload nötig.

export default function NewSpoolForm({
  products,
  onCreated,
}: {
  products: Product[]
  onCreated: (s: Spool) => void
}) {
  const defaultForm = {
    product_id: 0,
    gross_start_g: undefined as number | undefined,
    net_start_g: undefined as number | undefined,
    label_note: ''
  }
  const [form, setForm] = useState(defaultForm)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { ...form }
    if (payload.net_start_g === undefined) payload.net_start_g = 1000

    const { data } = await API.post<Spool>('/spools', payload)

    setForm(defaultForm)
    onCreated(data)

    // Direkt Label drucken
    await openLabelAsPng(data.id)
  }

  return (
    <form className="card grid" onSubmit={submit}>
      <h3>{t('new.spool')}</h3>
      <div className="grid cols-2">
        <label>
          {t('product')}
          <select
            value={form.product_id}
            onChange={e => setForm({ ...form, product_id: +e.target.value })}
            required
          >
            <option value={0}>{t('choose.product')}…</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.manufacturer} {p.name} · {p.color_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('gross')} (g)
          <input
            type="number"
            placeholder="1200"
            value={form.gross_start_g ?? ''}
            onChange={e => setForm({ ...form, gross_start_g: e.target.value ? +e.target.value : undefined })}
          />
        </label>
        <label>
          {t('net')} (g)
          <input
            type="number"
            placeholder={t('product.nominal.placeholder')}
            value={form.net_start_g ?? ''}
            onChange={e => setForm({ ...form, net_start_g: e.target.value ? +e.target.value : undefined })}
          />
        </label>
        <label>
          {t('label.note')}
          <input
            placeholder="Optional"
            value={form.label_note}
            onChange={e => setForm({ ...form, label_note: e.target.value })}
          />
        </label>
      </div>
      <button>{t('spool.apply')}</button>
    </form>
  )
}
