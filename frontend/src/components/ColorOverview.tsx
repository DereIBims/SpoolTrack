import React, { useMemo } from 'react'
import { Product, Spool } from '../api'

export default function ColorOverview({ products, spools }: { products: Product[], spools: Spool[] }) {
  // Statistik je Produkt: Rollenanzahl und Summe angefangener Rollen (g)
  const stats = useMemo(() => {
    const map: Record<number, { count: number; partialSum: number }> = {}
    for (const s of spools) {
      const entry = (map[s.product_id] ||= { count: 0, partialSum: 0 })
      entry.count += 1
      if (s.net_current_g > 0 && s.net_start_g > 0 && s.net_current_g < s.net_start_g) {
        entry.partialSum += s.net_current_g
      }
    }
    return map
  }, [spools])

  if (!products.length) return <div>Keine Produkte vorhanden.</div>

  return (
    <div
      className="item-list"
      style={{
        display: 'grid',
        gap: 14,
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
      }}
    >
      {products.map(p => {
        const entry = stats[p.id] || { count: 0, partialSum: 0 }
        return (
          <article key={p.id} className="item-card" style={{ gap: 8 }}>
            <div style={{ fontWeight: 700 }}>
              {p.manufacturer} {p.name}
            </div>

            {/* Material & Farbe in 2 Spalten, mit Überschriften wie bei "Auf Lager" */}
            <div className="item-field item-field-2col">
              <div className="item-col">
                <div className="item-label">Material</div>
                <div className="item-value">{p.material}</div>
              </div>
              <div className="item-col">
                <div className="item-label">Farbe</div>
                <div className="item-value">
                  {p.color_name}
                  <span
                    className="color-swatch"
                    style={{ ['--swatch' as any]: p.color_hex }}
                  />
                </div>
              </div>
            </div>

            {/* Lagerwerte: 2 Spalten, Titel + Werte */}
            <div className="item-field item-field-2col">
              <div className="item-col">
                <div className="item-label">Auf Lager</div>
                <div className="item-value">{entry.count}</div>
              </div>
              <div className="item-col">
                <div className="item-label">Rest offen</div>
                <div className="item-value">{entry.partialSum} g</div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
