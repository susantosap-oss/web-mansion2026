import { NextResponse } from 'next/server'

// Favourite disimpan di localStorage sisi client
// API ini hanya untuk sync ke GAS (opsional)
export async function POST(request: Request) {
  const { listingId, action } = await request.json() // action: 'add' | 'remove'
  return NextResponse.json({ success: true, listingId, action })
}
