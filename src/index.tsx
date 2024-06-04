import { List } from '@solid-primitives/list'
import { createDeepSignal } from '@solid-primitives/resource'
import clsx from 'clsx'
import { codeToHast, getHighlighter, type BundledTheme, type CodeOptionsSingleTheme } from 'shiki'
import {
  ComponentProps,
  Index,
  Show,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  onCleanup,
  useTransition,
  type JSX,
} from 'solid-js'
import { Dynamic } from 'solid-js/web'
// @ts-expect-error
import styles from './index.module.css'
import { calculateContrastingColor } from './utils/calculate-contrasting-color'
import { whenever } from './utils/conditionals'
import { processProps } from './utils/process-props'

type Root = Awaited<ReturnType<typeof codeToHast>>
type Theme = CodeOptionsSingleTheme<BundledTheme>['theme']
type HastNode = Root['children'][number]
type Dimensions = {
  width: number
  height: number
}

/** Get the longest line-size of a given string */
const calculateMaxCharCount = (source: string) => {
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
  props: Omit<ComponentProps<'div'>, 'style' | 'onInput'> & {
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
  const [source, setSource] = createSignal(config.defaultValue || config.value)
  const [characterDimensions, setCharacterDimensions] = createSignal<Dimensions>({
    width: 0,
    height: 0,
  })
  const maxCharCount = createMemo(() => calculateMaxCharCount(source()))
  const lineCount = createMemo(() => source().split('\n').length)

  const [, startTransition] = useTransition()

  // Get styles from current theme
  const [themeStyles] = createResource(
    () => [config.theme as Theme, config.lang] as const,
    ([theme, lang]) =>
      getHighlighter({ themes: [theme], langs: [lang] })
        .then(highlighter => highlighter.getTheme(theme))
        .then(theme => ({
          '--theme-selection-color': calculateContrastingColor(theme.bg),
          '--theme-background-color': theme.bg,
          '--theme-foreground-color': theme.fg,
        })),
  )

  // Sync local source signal with config.source
  createEffect(() => setSource(config.value))

  // Transform source to hast (hypertext abstract syntax tree)
  const [hast] = createResource(
    () => [source(), config.theme, config.lang] as const,
    ([source, theme, lang]) =>
      (source
        ? codeToHast(source, { lang, theme }).then(
            ({ children }) => (children[0] as unknown as Root).children[0],
          )
        : { children: undefined }) as unknown as Root,
    { storage: createDeepSignal },
  )
  // Get the current or latest children
  const hastNodes = () => (hast() || hast.latest)?.children

  return (
    <div
      class={clsx(styles.editor, config.class)}
      style={{
        ...themeStyles(),
        ...config.style,
        '--line-count': lineCount(),
        '--max-char-count': maxCharCount(),
        '--char-width': characterDimensions().width,
        '--char-height': characterDimensions().height,
      }}
      {...rest}
    >
      <div class={styles.container}>
        <code>
          <List each={hastNodes()}>{line => <HastNode node={line()} />}</List>
        </code>
        <textarea
          inputmode="none"
          autocomplete="off"
          spellcheck={false}
          class={styles.textarea}
          onInput={({ currentTarget: { value } }) => {
            // Update source with startTransition so Suspense is not triggered.
            startTransition(() => {
              setSource(value)
              config.onInput?.(value)
            })
          }}
          value={config.value}
        />
        <CharacterDimensions onResize={setCharacterDimensions} />
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

function CharacterDimensions(props: { onResize: (dimension: Dimensions) => void }) {
  const [character, setCharacter] = createSignal<HTMLElement>(null!)

  createEffect(
    whenever(character, character => {
      const resizeObserver = new ResizeObserver(() => {
        const { width, height } = character.getBoundingClientRect()
        props.onResize({ width, height })
      })
      resizeObserver.observe(character)
      onCleanup(() => resizeObserver.disconnect())
    }),
  )

  return <code ref={setCharacter} class={styles.character} innerText="m" aria-hidden />
}
