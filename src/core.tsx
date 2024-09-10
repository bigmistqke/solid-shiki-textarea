import { List } from '@solid-primitives/list'
import clsx from 'clsx'
import {
  LanguageRegistration,
  ThemeRegistration,
  ThemeRegistrationRaw,
  codeToHast,
  getHighlighterCore,
} from 'shiki'
import {
  ComponentProps,
  Index,
  Show,
  Suspense,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  onCleanup,
  splitProps,
  untrack,
  useTransition,
  type JSX,
} from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { calculateContrastingColor } from './utils/calculate-contrasting-color'
import { every, when, whenever } from './utils/conditionals'
import { getLineCount } from './utils/get-line-count'
import { getLineSize } from './utils/get-line-size'

type Root = Awaited<ReturnType<typeof codeToHast>>
type RootContent = Root['children'][0]
type HastNode = Root['children'][number]
type Dimensions = {
  width: number
  height: number
}

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
  /** The default source code to initialize the editor with. */
  defaultValue?: string
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
      'defaultValue',
      'lang',
      'onInput',
      'value',
      'style',
      'theme',
    ])
    const [source, setSource] = createSignal(config.defaultValue || config.value)
    const [characterDimensions, setCharacterDimensions] = createSignal<Dimensions>({
      width: 0,
      height: 0,
    })

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

    const hast = createMemo<RootContent | undefined>(previous => {
      const _highlighter = highlighter()
      const _lang = untrack(lang)?.[0]
      const _theme = untrack(theme)
      if (!_highlighter || !_lang || !_theme) return previous
      const _source = source()
      if (!source) return undefined
      const hast = _highlighter.codeToHast(_source, {
        lang: _lang.name,
        theme: _theme,
      })
      if (!hast.children[0]) return previous
      return hast.children[0]
    })

    const themeStyles = whenever(every(theme, highlighter), ([theme, highlighter]) => {
      const { fg, bg } = highlighter.getTheme(theme)
      return {
        '--selection-color': calculateContrastingColor(bg),
        '--background-color': bg,
        '--foreground-color': fg,
      }
    })

    const [, startTransition] = useTransition()
    function updateSource(source: string) {
      startTransition(() => setSource(source))
    }

    // Sync local source signal with config.source
    createEffect(() => updateSource(config.value))

    return (
      <div
        ref={props.ref}
        class={clsx(styles.editor, config.class)}
        style={{
          ...themeStyles(),
          ...config.style,
        }}
        {...rest}
      >
        <div
          class={styles.container}
          style={{
            'min-width': `${Math.ceil(getLineSize(source()) * characterDimensions().width + 1)}px`,
            'min-height': `${Math.ceil(getLineCount(source()) * characterDimensions().height)}px`,
          }}
        >
          <Suspense>
            <List each={when(hast, hast => 'children' in hast && hast.children)}>
              {line => <HastNode node={line()} />}
            </List>
          </Suspense>
          <textarea
            inputmode="none"
            autocomplete="off"
            spellcheck={false}
            class={styles.textarea}
            onInput={e => {
              const value = e.currentTarget.value
              updateSource(value)
              config.onInput?.(e)
            }}
            value={config.value}
          />
          <code
            ref={character => {
              const resizeObserver = new ResizeObserver(([entry]) => {
                setCharacterDimensions(entry!.contentRect)
              })
              resizeObserver.observe(character)
              onCleanup(() => resizeObserver.disconnect())
            }}
            class={styles.character}
            innerHTML="&nbsp;"
            aria-hidden
          />
        </div>
      </div>
    )
  }
}

function HastNode(props: { node: any }) {
  return (
    <Show when={props.node.type !== 'text' && props.node} fallback={props.node.value}>
      {node => (
        <Dynamic component={node().tagName || 'div'} {...node().properties}>
          <Index each={node().children}>{child => <HastNode node={child()} />}</Index>
        </Dynamic>
      )}
    </Show>
  )
}
