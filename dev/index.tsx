import { For, createSignal, useTransition, type Component } from 'solid-js'
import { render } from 'solid-js/web'
import { ShikiTextarea } from '../src'
import './index.css'
import { Lang, Theme, langs, themes } from './shiki-data'

const App: Component = () => {
  const [currentTheme, setCurrentTheme] = createSignal<Theme>(themes[0])
  const [currentLang, setCurrentLang] = createSignal<Lang>('tsx')
  const startTransition = useTransition()[1]

  return (
    <div class="App">
      <header>
        <h1>Solid Shiki Textarea</h1>
        <div class="inputs">
          <label>themes</label>
          <select
            value={currentTheme()}
            onInput={e => setCurrentTheme(e.currentTarget.value as Theme)}
          >
            <For each={themes}>{theme => <option>{theme}</option>}</For>
          </select>
          <label>languages</label>
          <select
            value={currentLang()}
            onInput={e => setCurrentLang(e.currentTarget.value as Lang)}
          >
            <For each={langs}>{language => <option>{language}</option>}</For>
          </select>
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
