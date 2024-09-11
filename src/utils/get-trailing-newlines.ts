export const getTrailingNewlines = (source: string) => source.match(/\n+$/)?.length || 0
