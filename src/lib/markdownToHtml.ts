// Lightweight Markdown → HTML converter
// Backward-compatible: konten lama yang sudah pakai <b><i> tetap bekerja

function inlineMd(text: string): string {
  // Links: [text](url)  — diproses sebelum * agar tidak clash
  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary-700 underline hover:text-gold">$1</a>',
  )
  // Images: ![alt](url)
  text = text.replace(
    /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g,
    '<img src="$2" alt="$1" class="rounded-xl my-4 max-w-full" loading="lazy"/>',
  )
  // Bold: **text** atau __text__
  text = text.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/__([^_\n]+)__/g, '<strong>$1</strong>')
  // Italic: *text* (setelah bold agar ** tidak terpotong)
  text = text.replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
  text = text.replace(/_([^_\n]+)_/g, '<em>$1</em>')
  // Strikethrough: ~~text~~
  text = text.replace(/~~([^~\n]+)~~/g, '<del>$1</del>')
  // Inline code: `code`
  text = text.replace(
    /`([^`]+)`/g,
    '<code class="bg-gray-100 text-primary-800 px-1 rounded text-sm font-mono">$1</code>',
  )
  // Linkify URL plain yang belum di-wrap
  text = text.replace(
    /(?<![='"(>])(\bhttps?:\/\/[^\s<>"')]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary-700 underline hover:text-gold break-all">$1</a>',
  )
  return text
}

export function markdownToHtml(md: string): string {
  if (!md) return ''

  const lines  = md.split('\n')
  const output: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Heading  # / ## / ###
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/)
    if (headingMatch) {
      const lvl = headingMatch[1].length
      const txt = inlineMd(headingMatch[2])
      const cls = lvl === 1
        ? 'text-2xl font-bold text-primary-900 mt-6 mb-3'
        : lvl === 2
        ? 'text-xl font-bold text-primary-900 mt-5 mb-2'
        : 'text-base font-semibold text-primary-900 mt-4 mb-1'
      const tag = lvl === 1 ? 'h2' : lvl === 2 ? 'h3' : 'h4'
      output.push(`<${tag} class="${cls}">${txt}</${tag}>`)
      i++; continue
    }

    // Horizontal rule: ---
    if (/^-{3,}$/.test(line.trim())) {
      output.push('<hr class="border-gray-200 my-6"/>')
      i++; continue
    }

    // Blockquote: > text
    if (line.startsWith('> ')) {
      output.push(
        `<blockquote class="border-l-4 border-gold pl-4 italic text-gray-500 my-3">${inlineMd(line.slice(2))}</blockquote>`,
      )
      i++; continue
    }

    // Unordered list: - / * / •
    if (/^[-*•] /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*•] /.test(lines[i])) {
        items.push(`<li>${inlineMd(lines[i].replace(/^[-*•] /, ''))}</li>`)
        i++
      }
      output.push(`<ul class="list-disc list-inside mb-4 space-y-1 text-gray-600">${items.join('')}</ul>`)
      continue
    }

    // Ordered list: 1. 2. ...
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(`<li>${inlineMd(lines[i].replace(/^\d+\.\s/, ''))}</li>`)
        i++
      }
      output.push(`<ol class="list-decimal list-inside mb-4 space-y-1 text-gray-600">${items.join('')}</ol>`)
      continue
    }

    // Empty line
    if (line.trim() === '') {
      output.push('<br/>')
      i++; continue
    }

    // Regular text line
    output.push(inlineMd(line))
    i++
  }

  return output.join('\n')
}
