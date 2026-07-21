/**
 * /api/search/options — Filter options dari CRM
 * Mengembalikan: property_types, transaction_types, cities, areas, statuses
 */

import { NextResponse } from 'next/server'

const CRM_URL = process.env.CRM_PUBLIC_URL || 'https://crm.mansionpro.id'
const API_KEY = process.env.CRM_PUBLIC_API_KEY || ''

export async function GET() {
  try {
    const res = await fetch(`${CRM_URL}/public/api/v1/search/options`, {
      headers: { 'x-api-key': API_KEY },
      next: { revalidate: 300 }, // cache 5 menit
    })

    if (!res.ok) throw new Error(`CRM options error ${res.status}`)

    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    console.error('[/api/search/options]', e)
    // Fallback dengan options umum properti Surabaya
    return NextResponse.json({
      success: true,
      data: {
        property_types:    ['Rumah', 'Apartemen', 'Ruko', 'Kavling', 'Gudang', 'Gedung'],
        transaction_types: ['Dijual', 'Disewakan'],
        cities:            ['Surabaya', 'Sidoarjo', 'Gresik', 'Malang'],
        areas:             [],
        statuses:          ['Aktif', 'Terjual', 'Disewa'],
        harga_min:         0,
        harga_max:         0,
      },
    })
  }
}
