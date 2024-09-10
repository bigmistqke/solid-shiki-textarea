import { Accessor } from 'solid-js'

const DEBUG = false

export class Cache<T> {
  #registry: Record<string, { value: T; count: number }> = {}

  add(key: string, callback: Accessor<T>) {
    let cached = this.#registry[key]
    console.log('cached', cached)
    if (cached) {
      cached.count++
      return cached.value
    }
    const value = callback()
    this.#registry[key] = {
      value,
      count: 0,
    }
    return value
  }

  cleanup(key: string) {
    if (!(key in this.#registry)) {
      console.warn(`Disposing unavailable key from cache: ${key}.`)
      return
    }
    this.#registry[key].count--
    if (this.#registry[key].count < 0) {
      delete this.#registry[key]
      DEBUG && console.info(`Deleted ${key} from registry`, this.#registry)
    }
  }
}
