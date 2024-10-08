import clsx from 'clsx'
import {
  getHighlighterCore,
  LanguageRegistration,
  ThemeRegistration,
  ThemeRegistrationRaw,
} from 'shiki'
import {
  ComponentProps,
  createRenderEffect,
  createResource,
  createSignal,
  onCleanup,
  Ref,
  splitProps,
  type JSX,
} from 'solid-js'
import { Language, Theme } from './tm'
import { Cache } from './utils/cache'
import { hexToRgb, luminance } from './utils/colors'
import { every, whenever } from './utils/conditionals'
import { getTrailingNewlines } from './utils/get-trailing-newlines'

/**********************************************************************************/
/*                                                                                */
/*                                   Constants                                    */
/*                                                                                */
/**********************************************************************************/

const HIGHLIGHTER = getHighlighterCore({
  themes: [],
  langs: [],
  loadWasm: import('shiki/wasm'),
})
const THEME_CACHE = new Cache<Promise<ThemeRegistration>>()
const LANG_CACHE = new Cache<Promise<LanguageRegistration[]>>()
const LOADED_LANGS = new WeakMap<Omit<ShikiTextareaProps['language'], string>, Promise<any>>()
const LOADED_THEMES = new WeakMap<Omit<ShikiTextareaProps['theme'], string>, Promise<any>>()

/**********************************************************************************/
/*                                                                                */
/*                                     Set Cdn                                    */
/*                                                                                */
/**********************************************************************************/

type Cdn = string | ((type: 'language' | 'theme', id: string) => string)
let CDN: Cdn = 'https://esm.sh'

/**
 * Sets the CDN from which the theme/lang of <shiki-textarea/> is fetched.
 *
 * Accepts as arguments
 * - url: string
 * - callback: (type: 'lang' | 'theme', id: string) => string
 *
 * When given an url, this will be used to fetch
 * - `${cdn}/tm-themes/themes/${theme}.json` for the `themes`
 * - `${cdn}/tm-grammars/grammars/${grammar}.json` for the `langs`
 *
 * When given a callback, the returned string will be used to fetch.
 */
export function setCDN(cdn: Cdn) {
  CDN = cdn
}

export function urlFromCdn(type: 'theme' | 'language', key: string) {
  if (typeof CDN === 'function') {
    return CDN(type, key)
  }
  return type === 'theme'
    ? `${CDN}/tm-themes/themes/${key}.json`
    : `${CDN}/tm-grammars/grammars/${key}.json`
}

/**********************************************************************************/
/*                                                                                */
/*                                 Shiki Textarea                                 */
/*                                                                                */
/**********************************************************************************/

declare module 'solid-js/jsx-runtime' {
  namespace JSX {
    interface CustomEvents {
      input: InputEvent
    }
  }
}

export type LanguageProp = Language | Promise<LanguageRegistration[]> | LanguageRegistration[]

export type ThemeProp =
  | Theme
  | Promise<ThemeRegistrationRaw | ThemeRegistration>
  | ThemeRegistrationRaw
  | ThemeRegistration

export interface ShikiTextareaProps extends Omit<ComponentProps<'div'>, 'style' | 'onInput'> {
  /** If textarea is editable or not. */
  editable?: boolean
  /**
   * The programming language of the source code for syntax highlighting.
   *
   * @example static import
   * ```tsx
   * import tsx from "shiki/langs/tsx.mjs"
   * return <ShikiTextArea language={tsx}/>
   * ```
   * @example dynamic import
   * ```tsx
   * return <ShikiTextArea language={import('shiki/langs/tsx.mjs')}/>
   * ```
   */
  language: LanguageProp
  /** Custom CSS properties to apply to the editor. */
  style?: JSX.CSSProperties
  /** Ref to the internal html-textarea-element. */
  textareaRef?: Ref<HTMLTextAreaElement>
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
  theme: ThemeProp
  /** The source code to be displayed and edited. */
  code: string
  /** Callback function to handle updates to the source code. */
  onInput?: (event: InputEvent & { currentTarget: HTMLTextAreaElement }) => void
}

export function createShikiTextarea(styles: Record<string, string>) {
  return function ShikiTextarea(props: ShikiTextareaProps) {
    const [config, rest] = splitProps(props, [
      'class',
      'language',
      'onInput',
      'code',
      'style',
      'theme',
      'editable',
    ])
    const [source, setSource] = createSignal(config.code)

    // lang
    const [language] = createResource(
      () => config.language,
      async language => {
        if (typeof language !== 'string') {
          return language
        }

        const url = urlFromCdn('language', language)

        onCleanup(() => LANG_CACHE.cleanup(url))

        return LANG_CACHE.add(url, () =>
          fetch(/* @vite-ignore */ url)
            .then(result => result.json())
            .then(result => [result] as any)
            .catch(console.error),
        )
      },
    )

    const [theme] = createResource(
      () => config.theme,
      async theme => {
        if (typeof theme !== 'string') {
          return theme
        }

        const url = urlFromCdn('theme', theme)

        onCleanup(() => THEME_CACHE.cleanup(url))

        return THEME_CACHE.add(url, () =>
          fetch(/* @vite-ignore */ url)
            .then(result => result.json())
            .catch(console.error),
        )
      },
    )

    const [highlighter] = createResource(every(theme, language), async ([theme, lang]) => {
      const highlighter = await HIGHLIGHTER
      await (LOADED_LANGS.get(lang) ??
        LOADED_LANGS.set(lang, highlighter.loadLanguage(lang)).get(lang))
      await (LOADED_THEMES.get(theme) ??
        LOADED_THEMES.set(theme, highlighter.loadTheme(theme)).get(theme))
      return highlighter
    })

    let previous: ChildNode | null = null
    const html = whenever(
      every(language, theme, highlighter, () => !highlighter.loading),
      ([[lang], theme, highlighter]) => {
        const html = highlighter.codeToHtml(source(), {
          lang: lang!.name,
          theme: theme,
        })
        return (previous = Document.parseHTMLUnsafe(html).body.firstChild!.firstChild)
      },
    )

    const themeStyles = whenever(every(theme, highlighter), ([theme, highlighter]) => {
      const { fg, bg } = highlighter.getTheme(theme)
      const commentLuminance = luminance(...hexToRgb(bg))
      const opacity = commentLuminance > 0.9 ? 0.1 : commentLuminance < 0.1 ? 0.25 : 0.175

      return {
        '--selection-color': `rgba(98, 114, 164, ${opacity})`,
        '--background-color': bg,
        '--foreground-color': fg,
      }
    })

    // NOTE:  Update to projection once this lands in solid 2.0
    //        Sync local source signal with config.source
    createRenderEffect(() => setSource(config.code))

    return (
      <div
        part="root"
        class={clsx(styles.root, config.class)}
        style={{
          ...themeStyles(),
          ...config.style,
        }}
        {...rest}
        data-editable={config.editable}
      >
        <div class={styles.container}>
          <pre part="code" class={styles.code}>
            {html() || previous}
            {`\n`.repeat(getTrailingNewlines(source()))}
          </pre>
          <textarea
            ref={props.textareaRef}
            part="textarea"
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

              // user provided callback
              config.onInput?.(e)
            }}
            value={config.code}
          />
        </div>
      </div>
    )
  }
}
