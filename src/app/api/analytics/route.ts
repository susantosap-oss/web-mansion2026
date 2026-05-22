import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const gasUrl = process.env.NEXT_PUBLIC_GAS_API_URL
  const secret = process.env.GAS_API_SECRET

  if (!gasUrl || !secret) {
    return NextResponse.json({ configured: false, message: 'GAS_API_URL atau GAS_API_SECRET belum diset.' })
  }

  try {
    const url = `${gasUrl}?action=getGA4Stats&secret=${encodeURIComponent(secret)}`
    const res  = await fetch(url, { cache: 'no-store' })
    const data = await res.json()

    if (!data.success) {
      return NextResponse.json({
        configured: true,
        error: data.error ?? 'GAS getGA4Stats gagal',
        code:  data.code,
        hint:  data.code === 403
          ? 'Akun GAS tidak punya akses ke property GA4. Pastikan script dijalankan sebagai akun yang punya akses GA4.'
          : undefined,
      }, { status: 500 })
    }

    return NextResponse.json({
      configured: true,
      daily:      data.daily,
      weekly:     data.weekly,
      monthly:    data.monthly,
      cities:     data.cities,
      typeCounts: data.typeCounts,
      topPages:   data.topPages,
      updatedAt:  data.updatedAt,
    })
  } catch (e: unknown) {
    return NextResponse.json(
      { configured: true, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    )
  }
}
