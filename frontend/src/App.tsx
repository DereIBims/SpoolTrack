import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { API, Product, Spool } from './api'
import NewProductForm from './components/NewProductForm'
import NewSpoolForm from './components/NewSpoolForm'
import SpoolList from './components/SpoolList'
import ColorOverview from './components/ColorOverview'
import { Plus, Palette, Boxes, Trash2, ChevronRight, ChevronDown } from 'lucide-react'
import { t } from './i18n-rt'
import './style.css'

export default function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [spools, setSpools] = useState<Spool[]>([])
  const [openAdd, setOpenAdd] = useState(false)
  const [openActive, setOpenActive] = useState(false)
  const [openEmpty, setOpenEmpty] = useState(false)

  const [materialFilter, setMaterialFilter] = useState<string>('')
  const [searchSpoolId, setSearchSpoolId] = useState<string>('')

  const refresh = useCallback(async () => {
    const [p, s] = await Promise.all([
      API.get<Product[]>('/products'),
      API.get<Spool[]>('/spools')
    ])
    setProducts(p.data)
    setSpools(s.data)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const activeSpools = spools.filter(s => s.net_current_g > 0)
  const emptySpools = spools.filter(s => s.net_current_g === 0)

  // Suche nach SpoolID (nur für "Aktive Rollen")
  const [spoolIdQuery, setSpoolIdQuery] = useState('')
  const displayedActiveSpools = useMemo(() => {
    const q = spoolIdQuery.trim()
    if (!q) return activeSpools
    return activeSpools.filter(s => String((s as any).id).includes(q))
  }, [activeSpools, spoolIdQuery])

  const materials = useMemo(() => {
    const list = Array.from(new Set(
      products
        .map(p => (p as any).material)
        .filter(Boolean)
    )) as string[]
    return list.sort((a, b) => a.localeCompare(b))
  }, [products])

  const filteredProductIds = useMemo(() => {
    if (!materialFilter) return new Set(products.map(p => (p as any).id))
    return new Set(
      products
        .filter(p => (p as any).material === materialFilter)
        .map(p => (p as any).id)
    )
  }, [products, materialFilter])

  const filteredProducts = useMemo(() => {
    if (!materialFilter) return products
    return products.filter(p => (p as any).material === materialFilter)
  }, [products, materialFilter])

  const filteredActiveSpools = useMemo(() => {
    return activeSpools
      .filter(s => filteredProductIds.has((s as any).product_id))
      .filter(s =>
        searchSpoolId.trim() === '' ||
        String(s.id).toLowerCase().includes(searchSpoolId.trim().toLowerCase())
      )
  }, [activeSpools, filteredProductIds, searchSpoolId])

  return (
    <div className="app">
      <h2>{t('app.title')}</h2>

      <section className="card">
        <button
          className="accordion"
          onClick={() => setOpenAdd(v => !v)}
          aria-expanded={openAdd}
        >
          <span className="left"><Plus size={18} /> {t('add.section')}</span>
          <span className="right">{openAdd ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</span>
        </button>
        {openAdd && (
          <div className="accordion-panel">
            <div className="grid cols-2">
              <NewProductForm onCreated={refresh} />
              <NewSpoolForm products={products} onCreated={refresh} />
            </div>
          </div>
        )}
      </section>

      <section className="card">
        <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h3 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Palette size={18} />{t('colors.section')}
          </h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem' }}>{t('material')}:</span>
            <select
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              aria-label="Material filtern"
            >
              <option value="">{t('all.section')}</option>
              {materials.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
        </div>
        <br></br>
        <ColorOverview products={filteredProducts} spools={filteredActiveSpools} />
      </section>

      <section className="card">
        {/* Kopfzeile mit Toggle + stets sichtbarem Suchfeld */}
        <div
          className="section-header"
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}
        >
          <button
            className="accordion"
            onClick={() => setOpenActive(o => !o)}
            aria-expanded={openActive}
            style={{ flex: 1 }}
          >
            <span className="left"><Boxes size={18} /> {t('active.spools')}</span>
            <span className="right">
              <span className="badge">{activeSpools.length}</span>
              {openActive ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </span>
          </button>

          {/* Suchfeld neben/in der Überschrift, sichtbar auch wenn zugeklappt */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem' }}>{t('spool.id')}:</span>
              <input
                type="text"
                value={spoolIdQuery}
                onChange={(e) => {
                  const val = e.target.value
                  setSpoolIdQuery(val)
                  if (val.trim() !== '') setOpenActive(true) // beim Tippen automatisch aufklappen
                }}
                style={{ maxWidth: 180 }}
                aria-label="Nach Spool-ID filtern"
              />
            </label>
            {spoolIdQuery && (
              <button
                type="button"
                onClick={() => setSpoolIdQuery('')}
                title="Filter zurücksetzen"
              >
                {t('reset.id.search')}
              </button>
            )}
          </div>
        </div>

        {openActive && (
          <div className="accordion-panel">
            <SpoolList products={products} spools={displayedActiveSpools} onChanged={refresh} showActions />
          </div>
        )}
      </section>

      <section className="card">
        <button className="accordion" onClick={() => setOpenEmpty(o => !o)} aria-expanded={openEmpty}>
          <span className="left"><Trash2 size={18} /> {t('empty.spools')}</span>
          <span className="right"><span className="badge">{emptySpools.length}</span>{openEmpty ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</span>
        </button>
        {openEmpty && (
          <div className="accordion-panel">
            <SpoolList products={products} spools={emptySpools} onChanged={refresh} showActions={false} />
          </div>
        )}
      </section>
    </div>
  )
}
