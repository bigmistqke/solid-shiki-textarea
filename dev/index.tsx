import self from '.?raw'
import { BundledLanguage, bundledLanguages, BundledTheme, bundledThemes } from 'shiki'
import { createSignal, For, Index, Show, type Component } from 'solid-js'
import { render } from 'solid-js/web'
import { ShikiTextarea } from 'solid-shiki-textarea'
import 'solid-shiki-textarea/custom-element'
import './index.css'

const App: Component = () => {
  const [value, setValue] = createSignal(
    Array.from({ length: 10 })
      .map(() => self)
      .join('\n'),
  )

  // Config
  const [componentType, setComponentType] = createSignal<'custom-element' | 'solid'>('solid')
  const [currentThemeName, setCurrentThemeName] = createSignal<BundledTheme>('aurora-x')
  const [currentLanguageName, setCurrentLanguageName] = createSignal<BundledLanguage>('tsx')

  const [fontSize, setFontSize] = createSignal(10)
  const [padding, setPadding] = createSignal(5)
  const [amount, setAmount] = createSignal(1)
  const [editable, setEditable] = createSignal(true)

  // Derived imports
  const theme = () => bundledThemes[currentThemeName()]().then(module => module.default)
  const language = () => bundledLanguages[currentLanguageName()]().then(module => module.default)

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
              onInput={e => setCurrentThemeName(e.currentTarget.value as BundledTheme)}
            >
              <For each={Object.keys(bundledThemes)}>{theme => <option>{theme}</option>}</For>
            </select>
          </div>
          <div>
            <label for="lang">languages</label>
            <select
              id="lang"
              value={currentLanguageName()}
              onInput={e => setCurrentLanguageName(e.currentTarget.value as BundledLanguage)}
            >
              <For each={Object.keys(bundledLanguages)}>
                {language => <option>{language}</option>}
              </For>
            </select>
          </div>
          <br />
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
            <label for="amount">amount</label>
            <input
              id="amount"
              type="number"
              onInput={e => setAmount(+e.currentTarget.value)}
              value={amount()}
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
        <Index each={Array.from({ length: amount() }).fill('')}>
          {() => (
            <div class="shikies">
              <Show
                when={componentType() === 'custom-element'}
                fallback={
                  <ShikiTextarea
                    editable={editable()}
                    value={value()}
                    lang={language()}
                    theme={theme()}
                    style={{
                      'font-size': `${fontSize()}pt`,
                      '--padding': `${padding()}px`,
                    }}
                    onInput={e => setValue(e.target.value)}
                  />
                }
              >
                <shiki-textarea
                  editable={editable()}
                  value={value()}
                  style={{
                    'font-size': `${fontSize()}pt`,
                    '--padding': `${padding()}px`,
                  }}
                  lang={currentLanguageName()}
                  theme={currentThemeName()}
                  onInput={e => setValue(e.target.value)}
                />
              </Show>
            </div>
          )}
        </Index>
      </main>
    </div>
  )
}

export default App

render(() => <App />, document.getElementById('root')!)
