import { NextResponse } from 'next/server'
import { google } from 'googleapis'

async function getLogoUrl(): Promise<string> {
  const sheetId = process.env.GOOGLE_SHEETS_ID
  if (!sheetId) return ''
  try {
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const privateKey  = process.env.GOOGLE_PRIVATE_KEY
    const auth = (clientEmail && privateKey)
      ? new google.auth.JWT({
          email: clientEmail,
          key:   privateKey.replace(/\\n/g, '\n'),
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        })
      : new google.auth.GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        })
    const sheets = google.sheets({ version: 'v4', auth: auth as any })
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'CONFIG',
    })
    const rows = (res.data.values || []) as string[][]
    const row  = rows.find(r => r[0] === 'logo_url')
    return row?.[1] || ''
  } catch { return '' }
}

function cloudinaryResize(url: string, size: number): string {
  if (!url.includes('cloudinary.com')) return url
  return url.replace('/upload/', `/upload/w_${size},h_${size},c_pad,b_rgb:0a2342,f_png/`)
}

const VALID_SIZES = new Set([72, 96, 128, 144, 152, 192, 384, 512])

export async function GET(_req: Request, { params }: { params: { size: string } }) {
  const size = parseInt(params.size)
  if (!VALID_SIZES.has(size)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const logoUrl = await getLogoUrl()

  if (!logoUrl) {
    // Fallback ke static icon
    return NextResponse.redirect(new URL(`/icons/icon-${size}x${size}.png`, process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'))
  }

  const iconUrl = cloudinaryResize(logoUrl, size)

  // Fetch dari Cloudinary dan return sebagai image
  const res = await fetch(iconUrl, { next: { revalidate: 3600 } })
  if (!res.ok) {
    return NextResponse.redirect(new URL(`/icons/icon-${size}x${size}.png`, process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'))
  }

  const buffer = await res.arrayBuffer()
  return new NextResponse(buffer, {
    headers: {
      'Content-Type':  'image/png',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
