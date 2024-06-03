import type { Component } from 'solid-js'
import { ShikiTextarea } from '../src'
import styles from './App.module.css'
const App: Component = () => {
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <ShikiTextarea
          class={styles.shikiTextarea}
          value="const sum = (a: string, b: string) => a + b"
          lang="tsx"
        />
      </header>
    </div>
  )
}

export default App
