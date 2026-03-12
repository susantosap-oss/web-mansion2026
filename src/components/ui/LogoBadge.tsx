'use client'
import { useLogo } from '@/hooks/useLogo'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  dark?: boolean  // dark bg = true (navbar/dashboard), light bg = false (login)
}

export default function LogoBadge({ size = 'md', dark = true }: Props) {
  const logoUrl = useLogo()

  const dims = { sm: 'w-8 h-8 text-lg', md: 'w-10 h-10 text-xl', lg: 'w-12 h-12 text-2xl' }[size]
  const bg   = dark ? 'bg-gold' : 'bg-primary-900'
  const text = dark ? 'text-primary-900' : 'text-gold'

  return (
    <div className={`${dims} ${bg} rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0`}>
      {logoUrl
        ? <img src={logoUrl} alt="Mansion Realty" className="w-full h-full object-contain p-1"/>
        : <span className={`${text} font-bold font-display`}>M</span>
      }
    </div>
  )
}
