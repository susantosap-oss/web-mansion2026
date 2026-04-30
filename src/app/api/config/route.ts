import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { google } from 'googleapis'

const SHEET_ID = process.env.GOOGLE_SHEETS_ID || ''

function getSheetsClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey  = process.env.GOOGLE_PRIVATE_KEY
  const auth = (clientEmail && privateKey)
    ? new google.auth.JWT({
        email: clientEmail,
        key:   privateKey.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      })
    : new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      })
  return google.sheets({ version: 'v4', auth: auth as any })
}

async function readConfigRows(): Promise<string[][]> {
  if (!SHEET_ID) return []
  const sheets = getSheetsClient()
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Sheets timeout')), 8000)
  )
  const res = await Promise.race([
    sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'CONFIG' }),
    timeout,
  ])
  return (res.data.values || []) as string[][]
}

const getCachedConfigRows = unstable_cache(
  readConfigRows,
  ['config-sheet-rows'],
  { revalidate: 300 }
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key') || ''
  if (!key) return NextResponse.json({ success: false, error: 'key required' })

  try {
    const rows = await getCachedConfigRows()
    const row  = rows.find(r => r[0] === key)
    const value = row ? (row[1] ?? null) : null
    return NextResponse.json(
      { success: true, value },
      { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' } }
    )
  } catch (e: any) {
    console.error('[config GET]', e.message)
    return NextResponse.json(
      { success: true, value: null, source: 'error' },
      { headers: { 'Cache-Control': 'public, max-age=60' } }
    )
  }
}

const GAS_URL    = process.env.NEXT_PUBLIC_GAS_API_URL || ''
const GAS_SECRET = process.env.GAS_API_SECRET || ''

async function saveViaGAS(key: string, value: string): Promise<boolean> {
  if (!GAS_URL) return false
  try {
    const url = new URL(GAS_URL)
    url.searchParams.set('action', 'saveConfig')
    url.searchParams.set('secret', GAS_SECRET)
    url.searchParams.set('key',    key)
    url.searchParams.set('value',  value)
    const res  = await fetch(url.toString(), { cache: 'no-store', signal: AbortSignal.timeout(8000) })
    const json = await res.json()
    return json.success === true
  } catch { return false }
}

export async function POST(request: Request) {
  const body = await request.json()
  const { key, value } = body
  if (!key)   return NextResponse.json({ success: false, error: 'key required' }, { status: 400 })
  if (value === undefined || value === null)
    return NextResponse.json({ success: false, error: 'value required' }, { status: 400 })

  const strValue = String(value)

  // ── Coba Sheets API langsung (perlu SA Editor) ──
  if (SHEET_ID) {
    try {
      const sheets = getSheetsClient()
      const rows   = await readConfigRows()
      const idx    = rows.findIndex(r => r[0] === key)

      if (idx >= 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range:         `CONFIG!A${idx + 1}:B${idx + 1}`,
          valueInputOption: 'RAW',
          requestBody: { values: [[key, strValue]] },
        })
      } else {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID,
          range:         'CONFIG!A:B',
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          requestBody: { values: [[key, strValue]] },
        })
      }
      return NextResponse.json({ success: true, gasSaved: true, message: '✅ Tersimpan ke Google Sheet!' })
    } catch (e: any) {
      console.warn('[config POST] Sheets API write failed, fallback ke GAS:', e.message)
    }
  }

  // ── Fallback: GAS saveConfig (untuk nilai pendek, maks ~1500 chars) ──
  if (strValue.length <= 1500) {
    const ok = await saveViaGAS(key, strValue)
    if (ok) return NextResponse.json({ success: true, gasSaved: true, message: '✅ Tersimpan via GAS!' })
  }

  return NextResponse.json({ success: false, error: 'Gagal menyimpan: akun tidak punya akses Editor ke sheet. Bagikan sheet ke 177351947478-compute@developer.gserviceaccount.com sebagai Editor.' }, { status: 500 })
}
