import { MetadataRoute } from 'next'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

  // Use dynamic /api/icon/[size] routes so icons are always served fresh from Cloudinary
  const icons: MetadataRoute.Manifest['icons'] = sizes.map(size => ({
    src:     `/api/icon/${size}`,
    sizes:   `${size}x${size}`,
    type:    'image/png' as const,
    purpose: 'maskable' as const,
  }))

  return {
    name:             'Mansion Realty',
    short_name:       'Mansion',
    description:      'Properti Impian Anda, Investasi Terbaik Anda',
    start_url:        '/',
    display:          'standalone',
    background_color: '#0a2342',
    theme_color:      '#0a2342',
    orientation:      'portrait-primary',
    icons,
    categories:       ['business', 'finance'],
    lang:             'id',
  }
}
