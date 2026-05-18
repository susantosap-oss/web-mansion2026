'use client'

const WA_NUMBER = '6281703133252'

export const WA_MSG_LISTINGS  = 'Halo Mansion Properti, saya tertarik dengan informasi daftar harga/unit di website, bisa berikan informasi lebih lanjut?'
export const WA_MSG_KPR       = 'Halo Mansion Properti, saya tertarik dengan informasi KPR dan Pembiayaan Properti di website, bisa berikan informasi lebih lanjut?'

export default function WhatsAppButton({ message = WA_MSG_LISTINGS }: { message?: string }) {
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hubungi Mansion Properti via WhatsApp"
      style={{
        position:        'fixed',
        bottom:          '24px',
        right:           '24px',
        zIndex:          9999,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        width:           '56px',
        height:          '56px',
        borderRadius:    '50%',
        backgroundColor: '#25D366',
        boxShadow:       '0 4px 16px rgba(37,211,102,0.45)',
        transition:      'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.transform = 'scale(1.1)'
        el.style.boxShadow = '0 6px 20px rgba(37,211,102,0.6)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.transform = 'scale(1)'
        el.style.boxShadow = '0 4px 16px rgba(37,211,102,0.45)'
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="30" height="30" fill="none" aria-hidden="true">
        <path fill="#fff" d="M24 4C13 4 4 13 4 24c0 3.6 1 6.9 2.7 9.8L4 44l10.5-2.7C17.3 43 20.6 44 24 44c11 0 20-9 20-20S35 4 24 4Z"/>
        <path fill="#25D366" d="M24 6.8c-9.5 0-17.2 7.7-17.2 17.2 0 3.3.9 6.4 2.6 9.1l.4.7-1.7 6.1 6.3-1.6.7.4c2.6 1.5 5.5 2.3 8.5 2.3h.1c9.5 0 17.2-7.7 17.2-17.2C41.2 14.5 33.5 6.8 24 6.8Z"/>
        <path fill="#fff" d="M18.1 14.8c-.4-.9-.8-.9-1.2-.9h-1c-.4 0-1 .1-1.5.7-.5.5-2 2-2 4.8s2.1 5.6 2.4 6c.3.3 4 6.4 9.9 8.7 4.9 1.9 5.9 1.5 7 1.4 1-.1 3.3-1.4 3.8-2.7.5-1.3.5-2.4.3-2.7-.2-.3-.6-.4-1.2-.7-.6-.3-3.3-1.6-3.8-1.8-.5-.2-.9-.3-1.3.3-.4.6-1.5 1.8-1.8 2.2-.3.4-.7.4-1.2.2-.6-.3-2.4-.9-4.6-2.8-1.7-1.5-2.8-3.4-3.2-3.9-.3-.6 0-.9.3-1.2l.9-1.1c.2-.3.3-.6.5-1 .2-.4.1-.8-.1-1.1l-1.9-4.5Z"/>
      </svg>
    </a>
  )
}
