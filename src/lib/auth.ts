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

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'mansion2026secret'
const COOKIE_NAME = 'mansion_session'

// Simple base64 JWT (tanpa library)
function btoa64(str: string): string {
  return Buffer.from(str).toString('base64url')
}
function atob64(str: string): string {
  return Buffer.from(str, 'base64url').toString()
}

export function createToken(user: AuthUser): string {
  const header  = btoa64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa64(JSON.stringify({ ...user, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }))
  const sig     = btoa64(`${header}.${payload}.${JWT_SECRET}`)
  return `${header}.${payload}.${sig}`
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
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

export { COOKIE_NAME }
