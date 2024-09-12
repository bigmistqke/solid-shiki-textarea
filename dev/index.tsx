import self from '.?raw'
import { createEffect, createSignal, For, Show, type Component } from 'solid-js'
import { render } from 'solid-js/web'
import { ShikiTextarea } from 'solid-shiki-textarea'
import 'solid-shiki-textarea/custom-element'
import { Language, languages, Theme, themes } from 'solid-shiki-textarea/tm'
import './index.css'

const sources = {
  large: Array.from({ length: 10 })
    .map(() => self)
    .join('\n'),
  small: `const sum = (a: number, b: number) => a + b`,
}
type Source = keyof typeof sources

const App: Component = () => {
  // Config
  const [componentType, setComponentType] = createSignal<'custom-element' | 'solid'>('solid')
  const [currentThemeName, setCurrentThemeName] = createSignal<Theme>('aurora-x')
  const [currentLanguageName, setCurrentLanguageName] = createSignal<Language>('tsx')

  const [fontSize, setFontSize] = createSignal(10)
  const [padding, setPadding] = createSignal(5)
  const [amount, setAmount] = createSignal(1)
  const [sourceType, setSourceType] = createSignal<Source>('small')
  const [editable, setEditable] = createSignal(true)

  const [value, setValue] = createSignal(sources[sourceType()])

  createEffect(() => setValue(sources[sourceType()]))

  // Derived imports
  const theme = () =>
    fetch(`https://esm.sh/tm-themes/themes/${currentThemeName()}.json`).then(value => value.json())
  const language = () =>
    fetch(`https://esm.sh/tm-grammars/grammars/${currentLanguageName()}.json`)
      .then(value => value.json())
      .then(value => [value])

  return (
    <div class="app">
      <div class="side-panel">
        <h1>Solid Shiki Textarea</h1>
        <footer>
          <div>
            <label for="mode">mode</label>
            <button
              id="mode"
              onClick={() =>
                setComponentType(type => (type === 'custom-element' ? 'solid' : 'custom-element'))
              }
            >
              {componentType()}
            </button>
          </div>
          <br />
          <div>
            <label for="theme">themes</label>
            <select
              id="theme"
              value={currentThemeName()}
              onInput={e => setCurrentThemeName(e.currentTarget.value as Theme)}
            >
              <For each={themes}>{theme => <option>{theme}</option>}</For>
            </select>
          </div>
          <div>
            <label for="lang">languages</label>
            <select
              id="lang"
              value={currentLanguageName()}
              onInput={e => setCurrentLanguageName(e.currentTarget.value as Language)}
            >
              <For each={languages}>{language => <option>{language}</option>}</For>
            </select>
          </div>
          <br />
          <div>
            <label for="source">source</label>
            <select
              id="source"
              value={sourceType()}
              onInput={e => setSourceType(e.currentTarget.value as Source)}
            >
              <For each={Object.keys(sources)}>{source => <option>{source}</option>}</For>
            </select>
          </div>
          <div>
            <label for="padding">padding</label>
            <input
              id="padding"
              type="number"
              onInput={e => setPadding(+e.currentTarget.value)}
              value={padding()}
            />
          </div>
          <div>
            <label for="font-size">font-size</label>
            <input
              id="font-size"
              type="number"
              onInput={e => setFontSize(+e.currentTarget.value)}
              value={fontSize()}
            />
          </div>
          <div>
            <label for="editable">editable</label>
            <button
              id="editable"
              onClick={e => {
                setEditable(editable => !editable)
              }}
            >
              {editable() ? 'enabled' : 'disabled'}
            </button>
          </div>
        </footer>
      </div>

      <main>
        <div class="resize-container">
          <Show
            when={componentType() === 'custom-element'}
            fallback={
              <ShikiTextarea
                editable={editable()}
                value={value()}
                language={language()}
                theme={theme()}
                style={{
                  'font-size': `${fontSize()}pt`,
                  padding: `${padding()}px`,
                  'min-height': '100%',
                  'min-width': '100%',
                }}
                onInput={e => setValue(e.currentTarget.value)}
              />
            }
          >
            <shiki-textarea
              editable={editable()}
              value={value()}
              style={{
                'font-size': `${fontSize()}pt`,
                padding: `${padding()}px`,
                'min-height': '100%',
                'min-width': '100%',
              }}
              language={language()}
              theme={theme()}
              onInput={e => setValue(e.currentTarget.value)}
            />
          </Show>
        </div>
      </main>
    </div>
  )
}

export default App

render(() => <App />, document.getElementById('root')!)
