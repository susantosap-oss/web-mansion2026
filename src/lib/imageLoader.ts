export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}): string {
  // Cloudinary: gunakan transformasi native CDN — tidak perlu /_next/image
  if (src.includes('res.cloudinary.com') && src.includes('/upload/')) {
    const [base, rest] = src.split('/upload/')
    const q = quality ?? 75
    return `${base}/upload/f_auto,q_${q},w_${width}/${rest}`
  }

  // URL lain (Google Drive, lh3.googleusercontent.com, dll): kembalikan apa adanya
  return src
}
