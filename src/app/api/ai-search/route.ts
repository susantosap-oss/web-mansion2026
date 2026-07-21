import { NextRequest, NextResponse } from 'next/server'

const CRM_URL = process.env.CRM_PUBLIC_URL || 'https://crm.mansionpro.id'
const API_KEY = process.env.CRM_PUBLIC_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const res = await fetch(`${CRM_URL}/public/api/v1/ai-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'AI Search error' },
      { status: 500 }
    )
  }
}
