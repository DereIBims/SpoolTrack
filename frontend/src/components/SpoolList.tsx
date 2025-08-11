import React, { useState } from 'react'
import { API, Spool, Product } from '../api'
import { openLabelAsPng } from '../utils/printLabel'
import LabelCard from './LabelCard'
import { ChevronDown, ChevronRight, Scale, QrCode } from 'lucide-react'
import { createRoot } from 'react-dom/client'
import html2canvas from 'html2canvas'

export default function SpoolList({
  spools,
  products,
  onChanged,
  showActions = true
}: {
  spools: Spool[]
  products: Product[]
  onChanged: () => void
  showActions?: boolean
}) {
  const [openId, setOpenId] = useState<string | null>(null)
  const mapProd: Record<number, Product> =
    Object.fromEntries(products.map(p => [p.id, p]))

  async function sendWeight(id: string) {
    const g = Number(prompt('Gemessenes BRUTTO (g):'))
    if (!Number.isFinite(g)) return
    await API.post(`/api/spools/${id}/weight`, { measured_g: g })
    onChanged()
  }


  if (!spools.length) return <div>Keine Rollen in dieser Kategorie.</div>

    return (
    <div className="item-list">
      {[...spools]
        .sort((a, b) => {
          const rank = (x: Spool) => {
            const isEmpty = x.net_current_g === 0
            const isFull = x.net_start_g > 0 && x.net_current_g === x.net_start_g
            const isPartial = x.net_current_g > 0 && x.net_current_g < x.net_start_g
            if (isPartial) return 0   // angefangene zuerst
            if (isFull) return 1      // dann volle
            if (isEmpty) return 2     // leere zuletzt
            return 3
          }
          const ra = rank(a), rb = rank(b)
          if (ra !== rb) return ra - rb
          // Tiebreaker: mehr Rest zuerst, sonst nach ID
          return (b.net_current_g - a.net_current_g) || (a.id as unknown as string).localeCompare(b.id as unknown as string)
        })
        .map(s => {
          const p = mapProd[s.product_id]
          const isOpen = openId === s.id

          // Statuslogik pro Eintrag (für Pill)
          const isEmpty = s.net_current_g === 0
          const isFull = s.net_current_g === s.net_start_g && s.net_start_g > 0
          const isPartial = s.net_current_g > 0 && s.net_current_g < s.net_start_g

          let pillClass = 'pill-empty'
          let pillLabel = 'Leer'
          if (isFull) {
            pillClass = 'pill-full'
            pillLabel = 'Voll'
          } else if (isPartial) {
            pillClass = 'pill-partial'
            pillLabel = 'Angefangen'
          }

          return (
            <article key={s.id} className="item-card">
              {/* Kopf */}
              <div className="item-head">
                <span className={`pill ${pillClass}`}>
                  {pillLabel}
                </span>

                <div className="item-grid">
                  <div className="item-field">
                    <div className="item-label">Rollen-ID</div>
                    <div className="item-value">{s.id}</div>
                  </div>
                  <div className="item-field">
                    <div className="item-label">Produkt</div>
                    <div className="item-value">
                      {p ? `${p.manufacturer} ${p.name}` : `#${s.product_id}`}
                    </div>
                  </div>
                  <div className="item-field">
                    <div className="item-label">Farbe</div>
                    <div className="item-value">
                      <span className="color-dot" style={{ background: p?.color_hex }} />
                      {p?.color_name ?? '–'}
                    </div>
                  </div>
                  <div className="item-field">
                    <div className="item-label">Netto Start</div>
                    <div className="item-value">{s.net_start_g} g</div>
                  </div>
                  <div className="item-field">
                    <div className="item-label">Rest</div>
                    <div className="item-value">{s.net_current_g} g</div>
                  </div>
                </div>

                {/* Chevron rechts */}
                {showActions ? (
                  <button
                    className="chevron-btn"
                    onClick={() => setOpenId(isOpen ? null : s.id)}
                    aria-expanded={isOpen}
                    aria-label="Details"
                  >
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                ) : null}
              </div>

              {/* Panel */}
              {showActions && isOpen && (
                <div className="item-panel">
                  <button className="btn" onClick={() => sendWeight(s.id)}>
                    <Scale size={16} /> Gewicht
                  </button>
                  <button className="btn" onClick={() => openLabelAsPng(s.id)}>
					<QrCode size={16} /> Label
				  </button>
                </div>
              )}
            </article>
          )
        })}
    </div>
  )
}
