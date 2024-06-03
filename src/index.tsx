import { createDeepSignal } from '@solid-primitives/resource'
import clsx from 'clsx'
import {
  bundledThemesInfo,
  codeToHast,
  type BundledTheme,
  type CodeOptionsSingleTheme,
} from 'shiki'
import {
  ComponentProps,
  Index,
  Show,
  Suspense,
  createEffect,
  createRenderEffect,
  createResource,
  createSignal,
  onCleanup,
  useTransition,
  type JSX,
} from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { when } from './utils/conditionals'
// @ts-expect-error
import styles from './index.module.css'
import { processProps } from './utils/process-props'

type Root = Awaited<ReturnType<typeof codeToHast>>
type Theme = CodeOptionsSingleTheme<BundledTheme>['theme']
type HastNode = Root['children'][number]

/** Get the longest line-size of a given string */
const getMaxLineSize = (source: string) => {
  let maximumLineSize = -Infinity
  source.split('\n').forEach(line => {
    if (line.length > maximumLineSize) {
      maximumLineSize = line.length
    }
  })
  return maximumLineSize
}

/** A textarea with syntax highlighting capabilities powered by [shiki](https://github.com/shikijs/shiki). */
export function ShikiTextarea(
  props: Omit<ComponentProps<'div'>, 'style'> & {
    /** Custom CSS properties to apply to the editor. */
    style?: JSX.CSSProperties
    /** The source code to be displayed and edited. */
    value: string
    /** The default source code to initialize the editor with. */
    defaultValue?: string
    /** The theme to apply for syntax highlighting. */
    theme?: Theme
    /** Callback function to handle updates to the source code. */
    onInput?: (source: string) => void
    /** The programming language of the source code for syntax highlighting. */
    lang?: string
  },
) {
  const [config, rest] = processProps(props, { lang: 'tsx', theme: 'min-light' }, [
    'class',
    'defaultValue',
    'lang',
    'onInput',
    'value',
    'style',
    'theme',
  ])
  const startTransition = useTransition()[1]

  const [source, setSource] = createSignal(config.defaultValue || config.value)
  const [characterWidth, setCharacterWidth] = createSignal<number>(0)
  const [lineSize, setMaxLineSize] = createSignal(0)

  // Transform source to hast (hypertext abstract syntax tree)
  const [hast] = createResource(
    source,
    async source =>
      (await codeToHast(source, { lang: config.lang || 'tsx', theme: config.theme || 'min-light' }))
        .children[0],
    { storage: createDeepSignal },
  )
  // Get styles from current theme
  const [themeStyles] = createResource(
    () => config.theme as Theme,
    () =>
      bundledThemesInfo
        .find(theme => theme.id === config.theme)
        ?.import()
        .then(module => {
          const colors = module.default.colors
          return {
            background: colors?.['editor.background'],
            'caret-color': colors?.['editor.foreground'],
            '--selection-bg-color': colors?.['editor.selectionHighlightBackground'],
          }
        }),
  )

  // Sync local source signal with config.source
  createEffect(() => setSource(config.value))

  // Whenever source changes update the maximum linesize of source
  createRenderEffect(() => setMaxLineSize(getMaxLineSize(source())))

  const onInput = (e: { currentTarget: HTMLTextAreaElement }) => {
    const value = e.currentTarget.value
    // Update source with startTransition so Suspense is not triggered.
    startTransition(() => {
      setSource(value)
      config.onInput?.(value)
    })
  }

  return (
    <Suspense>
      <div
        class={clsx(styles.editor, config.class)}
        style={{ ...themeStyles(), ...config.style }}
        {...rest}
      >
        <div class={styles.container}>
          <Show when={when(hast, hast => 'children' in hast && hast.children)}>
            {children => <Index each={children()}>{child => <HastNode node={child()} />}</Index>}
          </Show>
          <textarea
            class={styles.input}
            onInput={onInput}
            spellcheck={false}
            style={{ 'min-width': lineSize() * characterWidth() + 'px' }}
            value={config.value}
          />
          <Character onResize={setCharacterWidth} />
        </div>
      </div>
    </Suspense>
  )
}

function Character(props: { onResize: (width: number) => void }) {
  const character = (<code class={styles.character} innerText="m" />) as HTMLElement

  const resizeObserver = new ResizeObserver(() => {
    const { width } = character.getBoundingClientRect()
    props.onResize(width)
  })
  resizeObserver.observe(character)
  onCleanup(() => resizeObserver.disconnect())

  return character
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
