import Link from 'next/link'
import { google } from 'googleapis'

// Baca CONFIG sheet langsung via Sheets API (SSoT, sama seperti CRM)
export async function getContentConfig(key: string): Promise<string> {
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
    const rows: string[][] = (res.data.values || []) as string[][]
    // CONFIG sheet: kolom A = Key, kolom B = Value
    const row = rows.find(r => r[0] === key)
    if (row && row[1]) return String(row[1])
  } catch (e: any) {
    console.error(`[ContentPage] getContentConfig(${key}):`, e.message)
  }
  return ''
}

interface Props {
  title:    string
  icon:     string
  content:  string
  fallback: string
}

export default function ContentPage({ title, icon, content, fallback }: Props) {
  const text = content || fallback

  return (
    <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-400 hover:text-primary-900 transition-colors mb-4 inline-block">
            ← Kembali ke Beranda
          </Link>
          <div className="divider-gold mb-3"/>
          <h1 className="section-title flex items-center gap-2">
            <span>{icon}</span> {title}
          </h1>
        </div>

        {/* Content */}
        <div className="card p-8">
          {text ? (
            <div className="prose prose-gray max-w-none">
              {text.split('\n').map((line, i) => {
                if (!line.trim()) return <br key={i}/>
                if (line.startsWith('# '))  return <h2 key={i} className="text-xl font-bold text-primary-900 mt-6 mb-2">{line.slice(2)}</h2>
                if (line.startsWith('## ')) return <h3 key={i} className="text-lg font-semibold text-primary-900 mt-4 mb-2">{line.slice(3)}</h3>
                if (line.startsWith('- '))  return <li key={i} className="ml-4 text-gray-600 mb-1">{line.slice(2)}</li>
                return <p key={i} className="text-gray-600 leading-relaxed mb-2">{line}</p>
              })}
            </div>
          ) : (
            <p className="text-gray-400 italic text-center py-8">Konten sedang disiapkan.</p>
          )}
        </div>

        {/* Footer CTA */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 mb-3">Ada pertanyaan?</p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_OFFICE || '628219880889'}?text=Halo%20MANSION%20Realty`}
            target="_blank" rel="noopener noreferrer"
            className="btn-wa inline-flex px-6 py-2.5 text-sm">
            💬 Hubungi via WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
