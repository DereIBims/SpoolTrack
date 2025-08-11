import React, { useMemo } from 'react'
import { Product, Spool } from '../api'

export default function ColorOverview({ products, spools }: { products: Product[], spools: Spool[] }) {
  const counts = useMemo(() => {
    const map: Record<number, number> = {}
    for (const s of spools) map[s.product_id] = (map[s.product_id] || 0) + 1
    return map
  }, [spools])

  if (!products.length) return <div>Keine Produkte vorhanden.</div>

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Produkt</th>
          <th>Farbe</th>
          <th>Auf Lager (aktiv)</th>
        </tr>
      </thead>
      <tbody>
        {products.map(p => (
          <tr key={p.id}>
            <td>{p.manufacturer} {p.name}</td>
            <td><span className="color-dot" style={{background:p.color_hex}} />{p.color_name}</td>
            <td>{counts[p.id] ?? 0}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}