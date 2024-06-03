import { Colord, colord, extend } from 'colord'
import mixPlugin from 'colord/plugins/mix'

extend([mixPlugin])

export function calculateContrastingColor(hexColor: string): string {
  const backgroundColor = colord(hexColor)
  let selectionBackgroundColor: Colord

  // If the background color is light, darken it, otherwise lighten it
  if (backgroundColor.isLight()) {
    selectionBackgroundColor = backgroundColor.darken(0.1)
  } else {
    selectionBackgroundColor = backgroundColor.lighten(0.15)
  }

  return selectionBackgroundColor.toRgbString()
}
