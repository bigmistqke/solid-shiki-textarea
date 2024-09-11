import { createShikiTextarea } from './core'
import styles from './index.module.css'

/**
 * A textarea with syntax highlighting capabilities powered by [shiki](https://github.com/shikijs/shiki).
 *
 * @example static import
 * ```tsx
 * import andromeeda from "shiki/themes/andromeeda.mjs"
 * import tsx from "shiki/langs/tsx.mjs"
 * return (
 *  <ShikiTextArea
 *    theme={andromeeda}
 *    language={tsx}
 *  />
 * )
 * ```
 * @example dynamic import
 * ```tsx
 * return (
 *  <ShikiTextArea
 *    theme={import('shiki/themes/andromeeda.mjs')}
 *    language={import('shiki/langs/tsx.mjs')}
 *  />
 * )
 * ```
 */
export const ShikiTextarea = createShikiTextarea(styles)
