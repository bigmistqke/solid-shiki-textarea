import { Accessor } from 'solid-js'

const DEBUG = false

export class Cache<T> {
  #registry: Record<string, { value: T; count: number }> = {}

  add(key: string, callback: Accessor<T>) {
    let cached = this.#registry[key]
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
    const node = this.#registry[key]
    if (!node) {
      console.warn(`Disposing unavailable key from cache: ${key}.`)
      return
    }
    node.count--
    if (node.count < 0) {
      delete this.#registry[key]
      DEBUG && console.info(`Deleted ${key} from registry`, this.#registry)
    }
  }
}
