export function getLineSize(value: string) {
  let lineSize = -Infinity
  value.split('\n').forEach(line => {
    if (line.length > lineSize) {
      lineSize = line.length
    }
  })
  return lineSize
}
