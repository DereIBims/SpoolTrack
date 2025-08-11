import React from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { renderToStaticMarkup } from 'react-dom/server'

type Props = {
  data: {
    spool_id: string
    manufacturer: string
    name: string
    material?: string
    color_name: string
    color_hex: string
    note: string
  }
}

function filamentIconDataUrl() {
  const svg = renderToStaticMarkup(
    <svg viewBox="0 0 64 64" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="28" fill="none" stroke="black" strokeWidth="4" />
      <circle cx="32" cy="32" r="8" fill="none" stroke="black" strokeWidth="4" />
      <line x1="32" y1="4" x2="32" y2="60" stroke="black" strokeWidth="2" />
      <line x1="4" y1="32" x2="60" y2="32" stroke="black" strokeWidth="2" />
    </svg>
  )
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

export default function LabelCard({ data }: Props) {
  console.log(data.note)
  return (
    <div className="label-outer">
      <div className="label">
        <div className="left">
          {/* Überschrift ganz oben */}
          <div className="title">
            {data.manufacturer} {data.name}
          </div>

          {/* Material fett */}
          <div className="meta-material"><strong>{data.material ?? '–'}</strong></div>
          <div className="meta-color">{data.color_name}</div>
          {/* Hinweis / Note */}
          {data.note && <div className="meta-note">{data.note}</div>}
        </div>

        <div className="qr">
          <div className="qr-box">
            {/* QR jetzt kleiner */}
            <QRCodeCanvas
              value={data.spool_id}
              level="H"
              size={72}
              imageSettings={{
                src: filamentIconDataUrl(), // 👈 kleines SVG einer Filamentrolle
                height: 16,
                width: 16,
                excavate: true
              }}
            />
            <div className="qr-id">{data.spool_id}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
