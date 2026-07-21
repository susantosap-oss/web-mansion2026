/**
 * /api/search — Proxy ke CRM Property Search Engine
 * ============================================
 * Meneruskan query params ke CRM Public API.
 * CRM API key disimpan server-side (tidak expose ke browser).
 *
 * Params: keyword, property_type, transaction_type, city, area,
 *   cluster, developer, price_min, price_max, bedroom_min,
 *   bathroom_min, land_area_min, land_area_max,
 *   building_area_min, building_area_max, status, featured,
 *   sort, page, limit
 */

import { NextResponse } from 'next/server'

const CRM_URL = process.env.CRM_PUBLIC_URL || 'https://crm.mansionpro.id'
const API_KEY = process.env.CRM_PUBLIC_API_KEY || ''

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const upstream = new URL(`${CRM_URL}/public/api/v1/search`)
  searchParams.forEach((v, k) => {
    if (v) upstream.searchParams.set(k, v)
  })

  try {
    const res = await fetch(upstream.toString(), {
      headers: { 'x-api-key': API_KEY },
      cache: 'no-store',
    })

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: `CRM error ${res.status}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    console.error('[/api/search]', e)
    return NextResponse.json(
      { success: false, message: 'Search service tidak tersedia' },
      { status: 503 }
    )
  }
}
