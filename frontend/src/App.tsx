import React, { useEffect, useState, useCallback } from 'react'
import { API, Product, Spool } from './api'
import NewProductForm from './components/NewProductForm'
import NewSpoolForm from './components/NewSpoolForm'
import SpoolList from './components/SpoolList'
import ColorOverview from './components/ColorOverview'
import { Plus, Palette, Boxes, Trash2, ChevronRight, ChevronDown } from 'lucide-react'
import './style.css'

export default function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [spools, setSpools] = useState<Spool[]>([])
   const [openAdd, setOpenAdd] = useState(false);
  const [openActive, setOpenActive] = useState(false) // default closed
  const [openEmpty, setOpenEmpty] = useState(false)   // default closed

  const refresh = useCallback(async () => {
    const [p, s] = await Promise.all([
      API.get<Product[]>('/api/products'),
      API.get<Spool[]>('/api/spools')
    ])
    setProducts(p.data)
    setSpools(s.data)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const activeSpools = spools.filter(s => s.net_current_g > 0)
  const emptySpools = spools.filter(s => s.net_current_g === 0)

   return (
    <div className="app">
      <h2>Filament Lager</h2>

      {/* 1) Hinzufügen (aufklappbar) */}
      <section className="card">
        <button
          className="accordion"
          onClick={()=>setOpenAdd(v=>!v)}
          aria-expanded={openAdd}
        >
          <span className="left"><Plus size={18}/> Hinzufügen</span>
          <span className="right">{openAdd ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}</span>
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

      {/* 2) Farb-Übersicht */}
      <section className="card">
        <h3 className="section-title"><Palette size={18}/> Farb-Übersicht</h3>
        <ColorOverview products={products} spools={activeSpools} />
      </section>

      {/* 3) Aktive Rollen */}
      <section className="card">
        <button className="accordion" onClick={()=>setOpenActive(o=>!o)} aria-expanded={openActive}>
          <span className="left"><Boxes size={18}/> Aktive Rollen</span>
          <span className="right"><span className="badge">{activeSpools.length}</span>{openActive ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}</span>
        </button>
        {openActive && (
          <div className="accordion-panel">
            <SpoolList products={products} spools={activeSpools} onChanged={refresh} showActions />
          </div>
        )}
      </section>

      {/* 4) Leere Rollen */}
      <section className="card">
        <button className="accordion" onClick={()=>setOpenEmpty(o=>!o)} aria-expanded={openEmpty}>
          <span className="left"><Trash2 size={18}/> Leere Rollen</span>
          <span className="right"><span className="badge">{emptySpools.length}</span>{openEmpty ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}</span>
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
