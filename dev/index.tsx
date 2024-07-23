import { BundledLanguage, BundledTheme, bundledLanguages, bundledThemes } from 'shiki'
import { For, createSignal, type Component } from 'solid-js'
import { render } from 'solid-js/web'
import { ShikiTextarea } from '../src'
import './index.css'

const App: Component = () => {
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
        <ShikiTextarea
          class="shikiTextarea"
          value="const sum = (a: string, b: string) => a + b"
          lang={language()}
          theme={theme()}
        />
      </main>
    </div>
  )
}

export default App

render(() => <App />, document.getElementById('root')!)
