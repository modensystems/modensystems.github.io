import fs from 'node:fs'
import path from 'node:path'

const outDir = path.resolve('static/examples')
fs.mkdirSync(outDir, { recursive: true })

const palettes = [
  { bg: '#0f172a', accent: '#38bdf8', soft: '#1e293b', text: '#e2e8f0', ink: '#0b1220' },
  { bg: '#fff7ed', accent: '#ea580c', soft: '#ffedd5', text: '#9a3412', ink: '#7c2d12' },
  { bg: '#ecfdf5', accent: '#059669', soft: '#d1fae5', text: '#065f46', ink: '#064e3b' },
  { bg: '#111827', accent: '#fbbf24', soft: '#1f2937', text: '#f9fafb', ink: '#030712' },
  { bg: '#fdf2f8', accent: '#db2777', soft: '#fce7f3', text: '#9d174d', ink: '#831843' },
  { bg: '#eff6ff', accent: '#2563eb', soft: '#dbeafe', text: '#1e3a8a', ink: '#1e3a8a' },
  { bg: '#18181b', accent: '#a78bfa', soft: '#27272a', text: '#f4f4f5', ink: '#09090b' },
  { bg: '#fefce8', accent: '#ca8a04', soft: '#fef9c3', text: '#854d0e', ink: '#713f12' },
  { bg: '#f8fafc', accent: '#0f172a', soft: '#e2e8f0', text: '#0f172a', ink: '#020617' },
  { bg: '#fff1f2', accent: '#e11d48', soft: '#ffe4e6', text: '#9f1239', ink: '#881337' },
  { bg: '#f0fdfa', accent: '#0d9488', soft: '#ccfbf1', text: '#115e59', ink: '#134e4a' },
  { bg: '#1c1917', accent: '#fb923c', soft: '#292524', text: '#fafaf9', ink: '#0c0a09' },
]

const labels = [
  'corp.studio',
  'shop.modeun',
  'book.now',
  'folio.works',
  'club.space',
  'brand.store',
  'biz.home',
  'news.daily',
  'event.live',
  'catalog.co',
  'product.app',
  'brand.lab',
]

function r(n) {
  return Math.round(n * 10) / 10
}

function chrome(w, h, top = 40) {
  return `
  <rect width="${w}" height="${h}" rx="22" fill="#d1d5db"/>
  <rect x="8" y="8" width="${w - 16}" height="${h - 16}" rx="16" fill="#fff"/>
  <circle cx="26" cy="26" r="4.5" fill="#f87171"/>
  <circle cx="42" cy="26" r="4.5" fill="#fbbf24"/>
  <circle cx="58" cy="26" r="4.5" fill="#34d399"/>
  <rect x="76" y="19" width="${w - 108}" height="16" rx="8" fill="#f3f4f6"/>
  <rect x="8" y="${top}" width="${w - 16}" height="2" fill="#f3f4f6"/>
`
}

function layoutBlocks(kind, p, x, y, w, h) {
  const a = p.accent
  const s = p.soft
  const t = p.text
  switch (kind) {
    case 0: // corporate
      return `
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${p.bg}"/>
        <rect x="${x + 24}" y="${y + 28}" width="${Math.min(160, r(w * 0.28))}" height="12" rx="6" fill="${a}"/>
        <rect x="${x + 24}" y="${y + 56}" width="${Math.min(280, r(w * 0.45))}" height="28" rx="8" fill="${t}" opacity="0.9"/>
        <rect x="${x + 24}" y="${y + 98}" width="${Math.min(210, r(w * 0.35))}" height="10" rx="5" fill="${t}" opacity="0.35"/>
        <rect x="${x + 24}" y="${y + 118}" width="${Math.min(170, r(w * 0.28))}" height="10" rx="5" fill="${t}" opacity="0.22"/>
        <rect x="${x + 24}" y="${y + 150}" width="112" height="34" rx="12" fill="${a}"/>
        <rect x="${r(x + w * 0.55)}" y="${y + 36}" width="${r(w * 0.38)}" height="${r(h * 0.62)}" rx="18" fill="${s}"/>
        <rect x="${r(x + w * 0.58)}" y="${y + 56}" width="${r(w * 0.32)}" height="${r(h * 0.34)}" rx="12" fill="${a}" opacity="0.35"/>
      `
    case 1: // shop grid
      return `
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${p.bg}"/>
        <rect x="${x + 20}" y="${y + 20}" width="${w - 40}" height="54" rx="14" fill="${s}"/>
        <rect x="${x + 36}" y="${y + 36}" width="140" height="20" rx="8" fill="${a}"/>
        ${[0, 1, 2]
          .map((c) => {
            const cw = r((w - 56) / 3)
            const cx = r(x + 20 + c * (cw + 8))
            return `
              <rect x="${cx}" y="${y + 96}" width="${cw}" height="${h - 130}" rx="14" fill="${s}"/>
              <rect x="${cx + 14}" y="${y + 114}" width="${cw - 28}" height="${r(h * 0.28)}" rx="10" fill="${a}" opacity="${r(0.25 + c * 0.12)}"/>
              <rect x="${cx + 14}" y="${y + h - 58}" width="${r(cw * 0.55)}" height="10" rx="5" fill="${t}" opacity="0.35"/>
              <rect x="${cx + 14}" y="${y + h - 40}" width="${r(cw * 0.35)}" height="10" rx="5" fill="${a}"/>
            `
          })
          .join('')}
      `
    case 2: // booking
      return `
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${p.bg}"/>
        <rect x="${x + 20}" y="${y + 24}" width="${r(w * 0.48)}" height="${h - 56}" rx="18" fill="${s}"/>
        <rect x="${x + 40}" y="${y + 52}" width="${r(w * 0.3)}" height="22" rx="8" fill="${t}" opacity="0.85"/>
        <rect x="${x + 40}" y="${y + 92}" width="${r(w * 0.34)}" height="10" rx="5" fill="${t}" opacity="0.3"/>
        <rect x="${x + 40}" y="${y + 124}" width="${r(w * 0.36)}" height="42" rx="10" fill="#fff"/>
        <rect x="${x + 40}" y="${y + 180}" width="${r(w * 0.36)}" height="42" rx="10" fill="#fff"/>
        <rect x="${x + 40}" y="${y + 240}" width="120" height="28" rx="14" fill="${a}"/>
        <rect x="${r(x + w * 0.56)}" y="${y + 24}" width="${r(w * 0.36)}" height="${h - 56}" rx="18" fill="${a}" opacity="0.22"/>
        <rect x="${r(x + w * 0.6)}" y="${y + 70}" width="${r(w * 0.28)}" height="${r(h * 0.42)}" rx="14" fill="${a}" opacity="0.45"/>
      `
    case 3: // portfolio
      return `
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${p.bg}"/>
        ${[0, 1, 2, 3, 4, 5]
          .map((n) => {
            const col = n % 3
            const row = Math.floor(n / 3)
            const cw = r((w - 64) / 3)
            const ch = r((h - 72) / 2)
            const cx = r(x + 20 + col * (cw + 12))
            const cy = r(y + 24 + row * (ch + 12))
            return `
              <rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="14" fill="${s}"/>
              <rect x="${cx + 12}" y="${cy + 12}" width="${cw - 24}" height="${ch - 40}" rx="10" fill="${a}" opacity="${r(0.2 + (n % 4) * 0.12)}"/>
              <rect x="${cx + 12}" y="${cy + ch - 20}" width="${r(cw * 0.45)}" height="8" rx="4" fill="${t}" opacity="0.35"/>
            `
          })
          .join('')}
      `
    case 4: // community
      return `
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${p.bg}"/>
        <rect x="${x + 18}" y="${y + 20}" width="${r(w * 0.26)}" height="${h - 48}" rx="16" fill="${s}"/>
        ${[0, 1, 2, 3, 4]
          .map(
            (n) =>
              `<rect x="${x + 34}" y="${y + 44 + n * 42}" width="${r(w * 0.18)}" height="14" rx="7" fill="${a}" opacity="${r(0.3 + n * 0.08)}"/>`,
          )
          .join('')}
        ${[0, 1, 2]
          .map((n) => {
            const cardH = r((h - 56) / 3)
            const cy = r(y + 20 + n * (cardH + 8))
            return `
              <rect x="${r(x + w * 0.34)}" y="${cy}" width="${r(w * 0.58)}" height="${cardH}" rx="14" fill="${s}"/>
              <rect x="${r(x + w * 0.38)}" y="${cy + 18}" width="${r(w * 0.32)}" height="12" rx="6" fill="${t}" opacity="0.45"/>
              <rect x="${r(x + w * 0.38)}" y="${cy + 40}" width="${r(w * 0.46)}" height="8" rx="4" fill="${t}" opacity="0.22"/>
            `
          })
          .join('')}
      `
    default: // brand / store hero
      return `
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${p.bg}"/>
        <rect x="${x + 20}" y="${y + 20}" width="${w - 40}" height="${r(h * 0.34)}" rx="18" fill="${a}" opacity="0.25"/>
        <rect x="${x + 40}" y="${y + 48}" width="${Math.min(220, r(w * 0.4))}" height="24" rx="8" fill="${t}" opacity="0.85"/>
        <rect x="${x + 40}" y="${y + 86}" width="108" height="22" rx="11" fill="${a}"/>
        ${[0, 1, 2, 3]
          .map((c) => {
            const cw = r((w - 68) / 4)
            const cx = r(x + 20 + c * (cw + 8))
            return `
              <rect x="${cx}" y="${r(y + h * 0.44)}" width="${cw}" height="${r(h * 0.42)}" rx="14" fill="${s}"/>
              <circle cx="${r(cx + cw / 2)}" cy="${r(y + h * 0.58)}" r="${Math.min(28, r(cw * 0.28))}" fill="${a}" opacity="${r(0.25 + c * 0.1)}"/>
              <rect x="${cx + 12}" y="${r(y + h * 0.74)}" width="${r(cw * 0.55)}" height="8" rx="4" fill="${t}" opacity="0.35"/>
            `
          })
          .join('')}
      `
  }
}

function heroSvg(i) {
  const p = palettes[i]
  const w = 640
  const h = 400
  const top = 44
  const body = layoutBlocks(i % 6, p, 8, top, w - 16, h - top - 8)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="website mockup">
  ${chrome(w, h, top)}
  <text x="88" y="31" font-family="Segoe UI, Arial, sans-serif" font-size="9" fill="#9ca3af">${labels[i]}</text>
  ${body}
</svg>
`
}

function siteSvg(i) {
  const p = palettes[i]
  const w = 420
  const h = 640
  const top = 44
  const kind = i % 6
  const body = layoutBlocks(kind, p, 8, top, w - 16, h - top - 8)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="site example">
  ${chrome(w, h, top)}
  <text x="88" y="31" font-family="Segoe UI, Arial, sans-serif" font-size="9" fill="#9ca3af">${labels[i]}</text>
  ${body}
</svg>
`
}

for (let i = 0; i < 12; i++) {
  const n = String(i + 1).padStart(2, '0')
  fs.writeFileSync(path.join(outDir, `hero-${n}.svg`), heroSvg(i))
  fs.writeFileSync(path.join(outDir, `site-${n}.svg`), siteSvg(i))
}

console.log('Wrote 24 mockups to', outDir)
