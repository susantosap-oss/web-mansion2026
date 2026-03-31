// Server-only: googleapis tidak bisa di-bundle untuk client
import 'server-only'
import { google } from 'googleapis'
import { AgentScoreWeights, DEFAULT_SCORE_WEIGHTS } from '@/types'

function getSheetsReadClient() {
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
  return google.sheets({ version: 'v4', auth: auth as any })
}

async function readConfigRow(key: string): Promise<string | null> {
  const sheetId = process.env.GOOGLE_SHEETS_ID
  if (!sheetId) return null
  const sheets = getSheetsReadClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'CONFIG',
  })
  const rows = (res.data.values || []) as string[][]
  const row  = rows.find(r => r[0] === key)
  return row?.[1] ?? null
}

// Fetch score weights dari CONFIG sheet (SSoT, sama dengan /api/config)
export async function getScoreWeights(): Promise<AgentScoreWeights> {
  try {
    const value = await readConfigRow('score_weights')
    if (value) {
      const parsed = JSON.parse(value)
      return { ...DEFAULT_SCORE_WEIGHTS, ...parsed }
    }
  } catch { /* gunakan default */ }
  return DEFAULT_SCORE_WEIGHTS
}
