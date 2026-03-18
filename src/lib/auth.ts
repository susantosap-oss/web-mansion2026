// Simple auth system menggunakan JWT + GAS sebagai user store
import { cookies } from 'next/headers'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'agent' | 'admin' | 'superadmin'
  agentId?: string
  photo?: string
}

const JWT_SECRET  = process.env.NEXTAUTH_SECRET || ''
export const COOKIE_NAME = 'mansion_session'

function btoa64(str: string): string {
  return Buffer.from(str).toString('base64url')
}
function atob64(str: string): string {
  return Buffer.from(str, 'base64url').toString()
}

function makeSignature(header: string, payload: string): string {
  // HMAC-SHA256 menggunakan crypto bawaan Node.js
  const { createHmac } = require('crypto')
  return createHmac('sha256', JWT_SECRET || 'fallback-must-set-env')
    .update(`${header}.${payload}`)
    .digest('base64url')
}

export function createToken(user: AuthUser): string {
  const header  = btoa64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa64(JSON.stringify({ ...user, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }))
  const sig     = makeSignature(header, payload)
  return `${header}.${payload}.${sig}`
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    // Verifikasi signature — cegah token palsu
    const expectedSig = makeSignature(parts[0], parts[1])
    if (expectedSig !== parts[2]) return null
    const payload = JSON.parse(atob64(parts[1]))
    if (payload.exp < Date.now()) return null
    return payload as AuthUser
  } catch { return null }
}

export function getSession(): AuthUser | null {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    return verifyToken(token)
  } catch { return null }
}

