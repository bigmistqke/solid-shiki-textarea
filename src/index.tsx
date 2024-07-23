import { List } from '@solid-primitives/list'
import clsx from 'clsx'
import {
  HighlighterCore,
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
// @ts-expect-error
import styles from './index.module.css'
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
/*                                      Cache                                     */
/*                                                                                */
/**********************************************************************************/

const loadWasm = import('shiki/wasm')

const CACHE = new WeakMap<
  ThemeRegistrationRaw | ThemeRegistration,
  WeakMap<LanguageRegistration[], Promise<HighlighterCore>>
>()
function getCachedHighlighter([theme, lang]: [
  theme: ThemeRegistrationRaw | ThemeRegistration,
  lang: LanguageRegistration[],
]) {
  let highlighters = CACHE.get(theme)
  if (!highlighters) {
    CACHE.set(theme, new WeakMap())
    highlighters = CACHE.get(theme)!
  }
  let highlighter = highlighters.get(lang)
  if (!highlighter) {
    highlighter = getHighlighterCore({
      themes: [theme],
      langs: [lang],
      loadWasm,
    })
    highlighters.set(lang, highlighter)
  }
  return highlighter
}

/**********************************************************************************/
/*                                                                                */
/*                                 Shiki Textarea                                 */
/*                                                                                */
/**********************************************************************************/

interface ShikiTextareaProps extends Omit<ComponentProps<'div'>, 'style' | 'onInput' | 'lang'> {
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
  onInput?: (source: string) => void
}

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
 *    lang={tsx}
 *  />
 * )
 * ```
 * @example dynamic import
 * ```tsx
 * return (
 *  <ShikiTextArea
 *    theme={import('shiki/themes/andromeeda.mjs')}
 *    lang={import('shiki/langs/tsx.mjs')}
 *  />
 * )
 * ```
 */
export function ShikiTextarea(props: ShikiTextareaProps) {
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
  const [highlighter] = createResource(every(theme, lang), getCachedHighlighter)

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

  const themeStyles = whenever(theme, theme => {
    try {
      if (!theme.colors) {
        throw 'no colors present in theme'
      }
      if (!theme.colors['editor.background']) {
        throw 'no background color present'
      }
      return {
        '--theme-selection-color': calculateContrastingColor(theme.colors['editor.background']),
        '--theme-background-color': theme.colors['editor.background'],
        '--theme-foreground-color': theme.colors.foreground,
      }
    } catch (err) {
      console.error('error', err)
      return undefined
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
          onInput={({ currentTarget: { value } }) => {
            updateSource(value)
            config.onInput?.(value)
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
