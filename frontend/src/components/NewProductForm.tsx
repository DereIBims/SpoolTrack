import React, { useState } from 'react'
import { API } from '../api'
import { SketchPicker } from 'react-color'
import { t } from '../i18n-rt'

export default function NewProductForm({ onCreated }: { onCreated: () => void }) {
  const defaultForm = {
    name: '',
    manufacturer: '',
    material: '',
    color_name: '',
    color_hex: '#000000',
    nominal_net_g: undefined as number | undefined,
    stock_unopened: undefined as number | undefined,
  }
  const [form, setForm] = useState(defaultForm)
  const [pickerKey, setPickerKey] = useState(0)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { ...form, stock_unopened: 0  }
    if (payload.nominal_net_g === undefined) payload.nominal_net_g = 1000
    if (payload.stock_unopened === undefined) payload.stock_unopened = 0
    await API.post('/products', payload)
    setForm(defaultForm) // Felder leeren
	setPickerKey(prev => prev + 1) // 🔹 Picker neu mounten
    onCreated()
  }

  return (
  <form className="card grid" onSubmit={submit}>
    <h3>{t('new.product')}</h3>
    <div className="grid cols-2">
      <label>
        {t('product.name')}
        <input
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
        />
      </label>

      <label>
        {t('product.manufacturer')}
        <input
          value={form.manufacturer}
          onChange={e => setForm({ ...form, manufacturer: e.target.value })}
          required
        />
      </label>

      <label>
        {t('material')} (PLA, PETG…)
        <input
          value={form.material}
          onChange={e => setForm({ ...form, material: e.target.value })}
        />
      </label>

      <label>
        {t('product.color.name')}
        <input
          value={form.color_name}
          onChange={e => setForm({ ...form, color_name: e.target.value })}
          required
        />
      </label>

      <label>
        {t('product.nominal')} (g)
        <input
          type="number"
          placeholder="1000"
          value={form.nominal_net_g ?? ''}
          onChange={e =>
            setForm({
              ...form,
              nominal_net_g: e.target.value ? +e.target.value : undefined,
            })
          }
        />
      </label>

      {/* Farb-Picker zentriert */}
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', marginTop: 10 }}>
        <SketchPicker
		  key={pickerKey} // 🔹 erzwingt Reset
          color={form.color_hex}
          onChange={(c) => setForm({ ...form, color_hex: c.hex })}
          disableAlpha
          presetColors={[
            '#FFFFFF', '#FFFF66', '#CCFF66', '#00CC44', '#006644', '#006680', '#00CC99', '#66CCFF',
            '#3399FF', '#3333CC', '#663399', '#9933FF', '#FF00FF', '#CC99CC', '#FF6666', '#FF0000',
            '#996600', '#FF9933', '#FFE6CC', '#CCB366', '#996633', '#B3B3B3', '#808080', '#000000'
          ]}
        />
      </div>
    </div>

    <button>{t('save')}</button>
  </form>
)

}
