const cache = new Map()

export function sheet(text: string | CSSStyleSheet) {
  if (text instanceof CSSStyleSheet) {
    return text
  }
  if (!cache.has(text)) {
    const stylesheet = new CSSStyleSheet()
    stylesheet.replace(text)
    cache.set(text, stylesheet)
  }
  return cache.get(text)
}
