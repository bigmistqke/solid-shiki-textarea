<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=solid-shiki-textarea&background=tiles&project=%20" alt="solid-shiki-textarea">
</p>

# solid-shiki-textarea

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)

textarea with shiki syntax highlighting

## Quick start

Install it:

```bash
npm i solid-shiki-textarea
# or
yarn add solid-shiki-textarea
# or
pnpm add solid-shiki-textarea
```

Use it:

```tsx
import { ShikiTextarea } from 'solid-shiki-textarea'

export default () => (
  <ShikiTextarea
    lang="tsx"
    source="const sum = (a: string, b: string) => a + b"
    theme="min-light"
    onInput={source => console.log(source)}
  />
)
```
