import { BundledLanguage, bundledLanguages, BundledTheme, bundledThemes } from 'shiki'
import { createSignal, For, Show, type Component } from 'solid-js'
import { render } from 'solid-js/web'
import { ShikiTextarea } from 'solid-shiki-textarea'
import { registerShikiTextarea } from 'solid-shiki-textarea/custom-element'
import './index.css'

registerShikiTextarea()

const App: Component = () => {
  const [value, setValue] = createSignal('const sum = (a: string, b: string) => a + b')
  const [componentType, setComponentType] = createSignal<'custom-element' | 'solid'>(
    'custom-element',
  )
  const [currentThemeName, setCurrentThemeName] = createSignal<BundledTheme>('aurora-x')
  const [currentLanguageName, setCurrentLanguageName] = createSignal<BundledLanguage>('tsx')

  const language = () => bundledLanguages[currentLanguageName()]().then(module => module.default)
  const theme = () => bundledThemes[currentThemeName()]().then(module => module.default)

  return (
    <div class="App">
      <header>
        <h1>Solid Shiki Textarea</h1>
        <div class="inputs">
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
        </div>
      </header>
      <main>
        <Show
          when={componentType() === 'custom-element'}
          fallback={
            <ShikiTextarea
              value={value()}
              lang={language()}
              theme={theme()}
              style={{
                '--padding': '10px',
                '--height': '100px',
              }}
              onInput={e => setValue(e.target.value)}
            />
          }
        >
          <shiki-textarea
            value={value()}
            style={{
              '--padding': '10px',
              '--height': '100px',
            }}
            lang={currentLanguageName()}
            theme={currentThemeName()}
            onInput={e => setValue(e.target.value)}
          />
        </Show>
      </main>
    </div>
  )
}

export default App

render(() => <App />, document.getElementById('root')!)
