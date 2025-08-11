import React from 'react'
import { QRCodeCanvas } from 'qrcode.react'

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

export default function LabelCard({ data }: Props) {
  const url = `${window.location.origin}/#/spool/${data.spool_id}`
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
            <QRCodeCanvas value={url} size={72} includeMargin={false} />
            <div className="qr-id">{data.spool_id}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
