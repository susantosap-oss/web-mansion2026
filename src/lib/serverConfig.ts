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
    : new google.auth.GoogleAuth({ scopes: ['https://www.googleapis.com/auth/spreadsheets'] })
  return google.sheets({ version: 'v4', auth: auth as any })
}

export async function readConfigRows(): Promise<string[][]> {
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

export async function readConfig(key: string): Promise<string | null> {
  try {
    const rows = await readConfigRows()
    const row  = rows.find(r => r[0] === key)
    return row ? (row[1] ?? null) : null
  } catch { return null }
}
