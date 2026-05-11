'use client'
import LogoBadge from '@/components/ui/LogoBadge'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useFavourite } from '@/hooks/useFavourite'

type NavLink =
  | { label: string; href: string; dropdown?: undefined }
  | { label: string; href: string; dropdown: { label: string; href: string; desc?: string }[] }

const navLinks: NavLink[] = [
  { label: 'Beranda',          href: '/' },
  {
    label: 'Proyek Baru',
    href:  '/projects',
    dropdown: [
      { label: 'Semua Proyek',  href: '/projects',       desc: 'Lihat seluruh proyek aktif' },
      { label: 'Daftar Harga',  href: '/daftar-harga',   desc: 'Harga & estimasi per proyek' },
    ],
  },
  {
    label: 'Jual-Sewa',
    href:  '/listings',
    dropdown: [
      { label: 'Semua Listing',   href: '/listings',              desc: 'Properti dijual & disewa' },
      { label: 'Daftar Harga',    href: '/daftar-harga',          desc: 'Estimasi harga properti' },
      { label: 'Rumah Dijual',    href: '/listings/jual-rumah-surabaya',  desc: 'Surabaya' },
      { label: 'Rumah Sidoarjo',  href: '/listings/jual-rumah-sidoarjo', desc: 'Sidoarjo' },
      { label: 'Ruko Surabaya',   href: '/listings/harga-ruko-surabaya', desc: 'Komersial' },
      { label: 'Gudang Surabaya', href: '/listings/jual-gudang-surabaya',desc: 'Industri & logistik' },
    ],
  },
  { label: 'KPR & Pembiayaan', href: '/calculator' },
  { label: 'Agen',             href: '/agents' },
  { label: 'Berita',           href: '/news' },
]

function DropdownMenu({ items }: { items: { label: string; href: string; desc?: string }[] }) {
  return (
    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
      {items.map(item => (
        <Link key={item.href} href={item.href}
          className="flex flex-col px-4 py-2.5 hover:bg-primary-50 transition-colors group">
          <span className="text-sm font-semibold text-primary-900 group-hover:text-primary-700">
            {item.label}
          </span>
          {item.desc && (
            <span className="text-xs text-gray-400 mt-0.5">{item.desc}</span>
          )}
        </Link>
      ))}
    </div>
  )
}

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const pathname   = usePathname()
  const { total }  = useFavourite()
  const wa         = process.env.NEXT_PUBLIC_WA_OFFICE || '6281234567890'
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // Tutup dropdown & mobile menu saat navigasi
  useEffect(() => {
    setOpenDropdown(null)
    setMenuOpen(false)
  }, [pathname])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || menuOpen ? 'bg-primary-900 shadow-navy py-3' : 'bg-primary-900/95 backdrop-blur-sm py-4'}`}>
      <div className="section-wrapper flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <LogoBadge size="md" dark={true} />
          <div className="hidden sm:block">
            <span className="text-white font-display font-bold text-xl">MANSION</span>
            <span className="text-gold font-display text-xl ml-1">Realty</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-5" ref={dropdownRef}>
          {navLinks.map(link => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
            if (link.dropdown) {
              const isOpen = openDropdown === link.href
              return (
                <div key={link.href} className="relative">
                  <button
                    onClick={() => setOpenDropdown(isOpen ? null : link.href)}
                    className={`flex items-center gap-1 text-sm font-semibold transition-colors ${isActive || isOpen ? 'text-gold' : 'text-white/80 hover:text-white'}`}>
                    {link.label}
                    <svg className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  {isOpen && <DropdownMenu items={link.dropdown} />}
                </div>
              )
            }
            return (
              <Link key={link.href} href={link.href}
                className={`text-sm font-semibold transition-colors ${isActive ? 'text-gold' : 'text-white/80 hover:text-white'}`}>
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Link href="/favourites" className="relative p-2 text-white/70 hover:text-white transition-colors" title="Favorit Saya">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            {total > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {total > 9 ? '9+' : total}
              </span>
            )}
          </Link>

          <Link href="/login" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white transition-colors px-2 py-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Login
          </Link>

          <Link href="/listings/titip" className="hidden md:inline-flex btn-gold text-sm px-4 py-2">+ Titip Listing</Link>

          <button
            className="lg:hidden p-2 text-white"
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div id="mobile-menu" className="lg:hidden bg-primary-900 border-t border-white/10 py-4">
          <div className="section-wrapper flex flex-col gap-1">
            {navLinks.map(link => (
              <div key={link.href}>
                <Link href={link.href} onClick={() => setMenuOpen(false)}
                  className={`py-2 px-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between ${pathname === link.href ? 'text-gold bg-white/10' : 'text-white/80 hover:text-white hover:bg-white/5'}`}>
                  {link.label}
                </Link>
                {/* Sub-links mobile */}
                {link.dropdown && (
                  <div className="ml-4 mt-0.5 flex flex-col gap-0.5">
                    {link.dropdown.filter(d => d.href !== link.href).map(sub => (
                      <Link key={sub.href} href={sub.href} onClick={() => setMenuOpen(false)}
                        className="py-1.5 px-3 rounded-lg text-xs font-medium text-gold/80 hover:text-gold hover:bg-white/5 transition-colors">
                        → {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link href="/favourites" onClick={() => setMenuOpen(false)} className="py-2 px-3 rounded-lg text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5">
              ❤️ Favorit {total > 0 && `(${total})`}
            </Link>
            <Link href="/login" onClick={() => setMenuOpen(false)} className="py-2 px-3 rounded-lg text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5">
              👤 Login Agen/Admin
            </Link>
            <div className="mt-2 pt-2 border-t border-white/10">
              <Link href="/listings/titip" className="btn-gold text-center block" onClick={() => setMenuOpen(false)}>+ Titip Listing</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
