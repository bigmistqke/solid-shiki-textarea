import { For, createSignal, type Component } from 'solid-js'
import { render } from 'solid-js/web'
import { ShikiTextarea } from '../src'
import './index.css'
import { Lang, Theme, langs, themes } from './shiki-data'

const App: Component = () => {
  const [currentTheme, setCurrentTheme] = createSignal<Theme>(themes[0])
  const [currentLang, setCurrentLang] = createSignal<Lang>('tsx')

  return (
    <div class="App">
      <header>
        <h1>Solid Shiki Textarea</h1>
        <div class="inputs">
          <div>
            <label for="theme">themes</label>
            <select
              id="theme"
              value={currentTheme()}
              onInput={e => setCurrentTheme(e.currentTarget.value as Theme)}
            >
              <For each={themes}>{theme => <option>{theme}</option>}</For>
            </select>
          </div>
          <div>
            <label for="lang">languages</label>
            <select
              id="lang"
              value={currentLang()}
              onInput={e => setCurrentLang(e.currentTarget.value as Lang)}
            >
              <For each={langs}>{language => <option>{language}</option>}</For>
            </select>
          </div>
        </div>
      </header>
      <main>
        <ShikiTextarea
          class="shikiTextarea"
          value="const sum = (a: string, b: string) => a + b"
          lang={currentLang()}
          theme={currentTheme()}
        />
      </main>
    </div>
  )
}

export default App

render(() => <App />, document.getElementById('root')!)
