<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=solid-shiki-textarea&background=tiles&project=%20" alt="solid-shiki-textarea">
</p>

# 📄 solid-shiki-textarea

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)

Textarea with syntax highlighting powered by [solid-js](https://github.com/solidjs/solid) and [shiki](https://github.com/shikijs/shiki).

https://github.com/bigmistqke/solid-shiki-textarea/assets/10504064/7bb4a2e1-a2c4-460d-b782-fe9bf7cac43a

## Quick start

Install it:

```bash
npm i shiki solid-shiki-textarea
# or
yarn add shiki solid-shiki-textarea
# or
pnpm add shiki solid-shiki-textarea
```

Use it:

```tsx
// static import
import { ShikiTextarea } from 'solid-shiki-textarea'
import minLight from 'shiki/themes/min-light.mjs'
import tsx from 'shiki/langs/tsx.mjs'

export default () => (
  <ShikiTextarea
    lang={tsx}
    theme={minLight}
    value="const sum = (a: string, b: string) => a + b"
    onInput={console.log}
  />
)
```

```tsx
// dynamic import
import { ShikiTextarea } from 'solid-shiki-textarea'

export default () => (
  <ShikiTextarea
    lang={import('shiki/langs/tsx.mjs')}
    theme={import('shiki/themes/min-light.mjs')}
    value="const sum = (a: string, b: string) => a + b"
    onInput={console.log}
  />
)
```

## Note

It is implemented by having a textarea with transparent text laid over html generated with [shiki](https://github.com/shikijs/shiki).

Currently does not provide a way to do wrapping: the textarea will overflow if it is wider then its container.
