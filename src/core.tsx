import clsx from 'clsx'
import {
  LanguageRegistration,
  ThemeRegistration,
  ThemeRegistrationRaw,
  getHighlighterCore,
} from 'shiki'
import {
  ComponentProps,
  createRenderEffect,
  createResource,
  createSignal,
  splitProps,
  type JSX,
} from 'solid-js'
import { calculateContrastingColor } from './utils/calculate-contrasting-color'
import { every, whenever } from './utils/conditionals'

/**********************************************************************************/
/*                                                                                */
/*                                      Utils                                     */
/*                                                                                */
/**********************************************************************************/

async function resolve<T extends Record<string, any>>(
  value: T | Promise<T> | Promise<{ default: T }>,
) {
  if (value instanceof Promise) {
    const awaitedValue = await value
    if ('default' in awaitedValue) {
      return awaitedValue.default as T
    }
    return awaitedValue
  }
  return value
}

/**********************************************************************************/
/*                                                                                */
/*                                 Shiki Textarea                                 */
/*                                                                                */
/**********************************************************************************/
export interface ShikiTextareaProps
  extends Omit<ComponentProps<'div'>, 'style' | 'onInput' | 'lang'> {
  /** If textarea is editable or not. */
  editable?: boolean
  /**
   * The programming language of the source code for syntax highlighting.
   *
   * @example static import
   * ```tsx
   * import tsx from "shiki/langs/tsx.mjs"
   * return <ShikiTextArea lang={tsx}/>
   * ```
   * @example dynamic import
   * ```tsx
   * return <ShikiTextArea lang={import('shiki/langs/tsx.mjs')}/>
   * ```
   */
  lang:
    | Promise<LanguageRegistration[]>
    | Promise<{ default: LanguageRegistration[] }>
    | LanguageRegistration[]
  /** Custom CSS properties to apply to the editor. */
  style?: JSX.CSSProperties
  /**
   * The theme to apply for syntax highlighting.
   *
   * @example static import
   * ```tsx
   * import andromeeda from "shiki/theme/andromeeda.mjs"
   * return <ShikiTextArea theme={andromeeda}/>
   * ```
   * @example dynamic import
   * ```tsx
   * return <ShikiTextArea theme={import('shiki/theme/andromeeda.mjs')}/>
   * ```
   */
  theme:
    | Promise<ThemeRegistrationRaw | ThemeRegistration>
    | Promise<{ default: ThemeRegistrationRaw | ThemeRegistration }>
    | ThemeRegistrationRaw
    | ThemeRegistration
  /** The source code to be displayed and edited. */
  value: string
  /** Callback function to handle updates to the source code. */
  onInput?: (event: InputEvent & { target: HTMLTextAreaElement }) => void
}

const LOADED_LANGS = new WeakMap<ShikiTextareaProps['lang'], Promise<any>>()
const LOADED_THEMES = new WeakMap<ShikiTextareaProps['theme'], Promise<any>>()
const HIGHLIGHTER = getHighlighterCore({
  themes: [],
  langs: [],
  loadWasm: import('shiki/wasm'),
})

export function createShikiTextarea(styles: Record<string, string>) {
  return function ShikiTextarea(props: ShikiTextareaProps) {
    const [config, rest] = splitProps(props, [
      'class',
      'lang',
      'onInput',
      'value',
      'style',
      'theme',
      'editable',
    ])
    const [source, setSource] = createSignal(config.value)

    const [theme] = createResource(() => config.theme, resolve)
    const [lang] = createResource(() => config.lang, resolve)
    const [highlighter] = createResource(every(theme, lang), async ([theme, lang]) => {
      const highlighter = await HIGHLIGHTER

      if (!LOADED_LANGS.has(lang)) {
        LOADED_LANGS.set(lang, highlighter.loadLanguage(lang))
      }
      await LOADED_LANGS.get(lang)

      if (!LOADED_THEMES.has(theme)) {
        LOADED_THEMES.set(theme, highlighter.loadTheme(theme))
      }
      await LOADED_THEMES.get(theme)

      return highlighter
    })

    let previous: string | undefined = undefined
    const html = whenever(
      every(lang, theme, highlighter, source),
      ([[lang], theme, highlighter, source]) => {
        return (previous = highlighter.codeToHtml(source, {
          lang: lang!.name,
          theme: theme,
        }))
      },
    )

    const themeStyles = whenever(every(theme, highlighter), ([theme, highlighter]) => {
      const { fg, bg } = highlighter.getTheme(theme)
      return {
        '--selection-color': calculateContrastingColor(bg),
        '--background-color': bg,
        '--foreground-color': fg,
      }
    })

    // NOTE:  Update to projection once this lands in solid 2.0
    //        Sync local source signal with config.source
    createRenderEffect(() => setSource(config.value))

    return (
      <div
        class={styles.root}
        style={{
          ...themeStyles(),
          ...config.style,
        }}
      >
        <div ref={props.ref} class={clsx(styles.editor, config.class)} {...rest}>
          <div class={styles.container}>
            <code class={styles.code} innerHTML={html() || previous} />
            <textarea
              inputmode="none"
              autocomplete="off"
              spellcheck={false}
              class={styles.textarea}
              disabled={!config.editable}
              on:input={e => {
                const target = e.currentTarget
                const value = target.value

                // local
                setSource(value)

                // copy to custom element document fragment
                const rootNode = target.getRootNode()
                if (rootNode && rootNode instanceof ShadowRoot) {
                  rootNode.value = value
                }

                // user provided callback
                config.onInput?.(e)
              }}
              value={config.value}
            />
          </div>
        </div>
      </div>
    )
  }
}
