<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=solid-shiki-textarea&background=tiles&project=%20" alt="solid-shiki-textarea">
</p>

# 📄 solid-shiki-textarea

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)

Textarea with syntax highlighting powered by [solid-js](https://github.com/solidjs/solid) and
[shiki](https://github.com/shikijs/shiki).

https://github.com/bigmistqke/solid-shiki-textarea/assets/10504064/7bb4a2e1-a2c4-460d-b782-fe9bf7cac43a

## Installation

```bash
npm i shiki solid-shiki-textarea
# or
yarn add shiki solid-shiki-textarea
# or
pnpm add shiki solid-shiki-textarea
```

## Solid Component

The main export of `solid-shiki-textarea` is a solid component.

### Types

```ts
interface ShikiTextareaProps extends Omit<ComponentProps<'div'>, 'style' | 'lang'> {
  lang:
    | Promise<LanguageRegistration[]>
    | Promise<{ default: LanguageRegistration[] }>
    | LanguageRegistration[]
  theme:
    | Promise<ThemeRegistrationRaw | ThemeRegistration>
    | Promise<{ default: ThemeRegistrationRaw | ThemeRegistration }>
    | ThemeRegistrationRaw
    | ThemeRegistration
  value: string
  editable?: boolean
  onInput?: (event: InputEvent & { target: HTMLTextAreaElement }) => void
  style?: JSX.CSSProperties
}
```

### Usage

**Static import of `theme/lang`**

```tsx
import { ShikiTextarea } from 'solid-shiki-textarea'
import minLight from 'shiki/themes/min-light.mjs'
import tsx from 'shiki/langs/tsx.mjs'

export default () => (
  <ShikiTextarea
    lang={tsx}
    theme={minLight}
    value="const sum = (a: string, b: string) => a + b"
    editable={true}
    style={{
      padding: '10px',
      'font-size': '16pt',
    }}
    onInput={e => console.log(e.target.value)}
  />
)
```

**Dynamic import of `theme/lang`**

```tsx
import { ShikiTextarea } from 'solid-shiki-textarea'

export default () => (
  <ShikiTextarea
    lang={import('https://esm.sh/shiki/langs/tsx.mjs')}
    theme={import('https://esm.sh/shiki/themes/min-light.mjs')}
    value="const sum = (a: string, b: string) => a + b"
    editable={true}
    style={{
      padding: '10px',
      'font-size': '16pt',
    }}
    onInput={e => console.log(e.target.value)}
  />
)
```

## Custom Element

We also export a custom-element wrapper `<shiki-textarea/>` powered by
[@lume/element](https://github.com/lume/element)

### Types

```ts
interface ShikiTextareaAttributes extends {
  lang?: BundledLanguage
  theme?: BundledTheme
  value?: string
  editable?: boolean
  onInput?: (event:InputEvent & { target: HTMLTextAreaElement }) => void
  stylesheet?: string | CSSStyleSheet
}
```

### Usage

```tsx
import { setCDN } from 'solid-shiki-textarea/custom-element'

// Set base-url of CDN directly (defaults to https://esm.sh)
setCDN('https://unpkg.com')
// Or use the callback-form
setCDN((type, id) => `./shiki/${type}/${id}.json`)

export default () => (
  <shiki-textarea
    lang="tsx"
    theme="andromeeda"
    value="const sum = (a: string, b: string) => a + b"
    editable={true}
    style={{
      '--padding': '10px',
      'font-size': '16pt',
    }}
    onInput={e => console.log(e.target.value)}
    stylesheet=".editor{ background:transparent;}"
  />
)
```

## CSS Variables

The following css-variables are available:

- `--padding`
- `--padding-top`
- `--padding-bottom`
- `--padding-left`
- `--padding-right`
- `--width`
- `--height`

For the solid-component, these can also be set directly from the component's `style`-prop:

```tsx
<ShikiTextarea style={{padding: '10px'}}>
// instead of
<ShikiTextarea style={{'--padding': '10px'}}>
```
