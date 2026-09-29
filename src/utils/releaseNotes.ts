function htmlToText(html: string): string {
  return html
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*li[^>]*>/gi, '• ')
    .replace(/<\/\s*(p|li|div|h[1-6]|ul|ol|pre|blockquote)\s*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function normalizeReleaseNotes(notes: unknown): string {
  let raw = ''
  if (typeof notes === 'string') {
    raw = notes
  } else if (Array.isArray(notes)) {
    raw = notes.map((entry) => {
      if (typeof entry === 'string') return entry
      if (entry && typeof entry === 'object' && 'note' in entry && typeof entry.note === 'string') {
        return entry.note
      }
      return ''
    }).filter(Boolean).join('\n\n')
  }
  return htmlToText(raw)
}