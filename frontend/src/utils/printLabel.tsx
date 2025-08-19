// src/utils/printLabel.tsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import html2canvas from 'html2canvas'
import { API } from '../api'
import LabelCard from '../components/LabelCard'

export async function openLabelAsPng(spoolId: string) {
  const { data } = await API.get(`/spools/${spoolId}/label`)

  // Offscreen Container
  const holder = document.createElement('div')
  holder.style.position = 'fixed'
  holder.style.left = '-10000px'
  holder.style.top = '-10000px'
  holder.style.background = '#fff'
  document.body.appendChild(holder)

  const root = createRoot(holder)
  root.render(<LabelCard data={data} />)

  // kurz warten, bis DOM steht
  await new Promise(res => setTimeout(res, 50))

  const el = holder.querySelector('.label-outer') as HTMLElement
  if (!el) { root.unmount(); document.body.removeChild(holder); return }

  const canvas = await html2canvas(el, {
    backgroundColor: '#ffffff',
    scale: 2,
    width: el.offsetWidth,
    height: el.offsetHeight,
    scrollX: 0,
    scrollY: 0,
    useCORS: true
  })
  const dataUrl = canvas.toDataURL('image/png')

  const win = window.open('', '_blank')
  if (win) {
    win.document.write(`
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Label</title>
          <style>
            @page {margin: 0; }
            html, body {
              width: 57mm; height: 31mm;
              margin: 0; padding: 0; overflow: hidden;
              background: #fff;
            }
            * { margin: 0; padding: 0; }
            #wrap { width: 57mm; height: 32mm; }
            img { width: 57mm; height: 32mm; display: block; }
          </style>
        </head>
        <body>
          <div id="wrap">
            <img src="${dataUrl}" />
          </div>
          <script>
			setTimeout(() => {
			window.print();
			setTimeout(() => window.close(), 200);
			}, 100);
		  </script>
        </body>
      </html>
    `)
    win.document.close()
  }

  root.unmount()
  document.body.removeChild(holder)
}
