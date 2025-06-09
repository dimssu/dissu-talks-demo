// Extract a dominant/accent color from HTML (looks for gradients, hex, rgb, named colors)
export function extractAccentColor(html: string): string | null {
  // Try to find a linear-gradient color
  const gradMatch = html.match(/linear-gradient\([^,]+,\s*([^\s,]+)/i)
  if (gradMatch) return gradMatch[1]
  // Try to find a hex color
  const hexMatch = html.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/)
  if (hexMatch) return `#${hexMatch[1]}`
  // Try to find an rgb color
  const rgbMatch = html.match(/rgb\((\d{1,3},\s*\d{1,3},\s*\d{1,3})\)/)
  if (rgbMatch) return `rgb(${rgbMatch[1]})`
  // Try to find a named color
  const nameMatch = html.match(/color:\s*([a-zA-Z]+)/)
  if (nameMatch) return nameMatch[1]
  return null
}

// Determine if a color is light or dark (for text contrast)
export function getContrastTextColor(bg: string): string {
  // Only works for hex and rgb
  let r = 0, g = 0, b = 0
  if (bg.startsWith('#')) {
    const hex = bg.replace('#', '')
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16)
      g = parseInt(hex[1] + hex[1], 16)
      b = parseInt(hex[2] + hex[2], 16)
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16)
      g = parseInt(hex.substring(2, 4), 16)
      b = parseInt(hex.substring(4, 6), 16)
    }
  } else if (bg.startsWith('rgb')) {
    const parts = bg.match(/\d+/g)
    if (parts && parts.length >= 3) {
      r = parseInt(parts[0])
      g = parseInt(parts[1])
      b = parseInt(parts[2])
    }
  } else {
    // fallback
    return '#fff'
  }
  // Perceived brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 150 ? '#222' : '#fff'
} 