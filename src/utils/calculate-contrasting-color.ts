import { contrast, hexToRgb, hslToRgb, rgbToHsl } from './colors'

const CACHE = new Map()

export function calculateContrastingColor(backgroundHex: string) {
  const cached = CACHE.get(backgroundHex)
  if (cached) return cached

  const backgroundRgb = hexToRgb(backgroundHex)
  let adjustedColor = backgroundRgb
  let hsl = rgbToHsl(adjustedColor[0], adjustedColor[1], adjustedColor[2])
  const isDark = hsl[2] < 0.5
  let newContrastRatio = 0

  let count = 0

  // Adjust lightness to reach contrast ratio of 5.5
  while (count < 200) {
    // Increment or decrement lightness
    hsl[2] += isDark ? 0.001 : -0.001

    if (hsl[2] <= 0 || hsl[2] >= 1) {
      break // Stop if lightness is out of bounds
    }

    adjustedColor = hslToRgb(hsl[0], hsl[1], hsl[2])
    newContrastRatio = contrast(adjustedColor, backgroundRgb)

    if (newContrastRatio > 4.5) {
      break
    }

    count++
  }

  const result = `#${(
    (1 << 24) +
    (adjustedColor[0] << 16) +
    (adjustedColor[1] << 8) +
    adjustedColor[2]
  )
    .toString(16)
    .slice(1)
    .toUpperCase()}`

  CACHE.set(backgroundHex, result)

  return result
}
