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

<details>
<summary>Prop Types</summary>

```ts
import type { LanguageRegistration, ThemeRegistration } from 'shiki'
import type { Language, Theme } from 'shiki-textarea/tm'

type LanguageProps = 
  | Language 
  | LanguageRegistration[] 
  | Promise<LanguageRegistration[]>

type ThemeProps = 
  | Theme 
  | ThemeRegistration 
  | Promise<ThemeRegistration>

interface ShikiTextareaProps extends Omit<ComponentProps<'div'>, 'style'> {
  language: LanguageProps
  theme: ThemeProps
  value: string
  editable?: boolean
  style?: JSX.CSSProperties
  onInput?: (event: InputEvent & { target: HTMLTextAreaElement }) => void
}
```

</details>

### Usage

**Static import of `theme/language`**

```tsx
import { ShikiTextarea } from 'solid-shiki-textarea'
import minLight from 'shiki/themes/min-light.mjs'
import tsx from 'shiki/langs/tsx.mjs'

export default () => (
  <ShikiTextarea
    language={tsx}
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

**Dynamic import of `theme/language`**

```tsx
import { ShikiTextarea } from 'solid-shiki-textarea'

export default () => (
  <ShikiTextarea
    language={import('https://esm.sh/shiki/langs/tsx.mjs')}
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

<details>
<summary>Attribute Types</summary>

```ts
import { LanguageProps, ThemeProps } from "shiki-textarea"

interface ShikiTextareaAttributes extends ComponentProps<'div'> {
  language?: LanguageProps
  theme?: ThemeProps
  value?: string
  editable?: boolean
  stylesheet?: string | CSSStyleSheet
  onInput?: (event:InputEvent & { target: HTMLTextAreaElement }) => void
}
```

</details>

### Usage

```tsx
import { setCDN } from 'solid-shiki-textarea'
import 'solid-shiki-textarea/custom-element'

setCDN('/shiki')

export default () => (
  <shiki-textarea
    language="tsx"
    theme="andromeeda"
    value="const sum = (a: string, b: string) => a + b"
    editable={true}
    style={{
      padding: '10px',
      'font-size': '16pt',
    }}
    stylesheet="code, code * { font-style:normal; }"
    onInput={e => console.log(e.target.value)}
  />
)
```

### Styling The Custom Element

Some DOM [`::part()`](https://developer.mozilla.org/en-US/docs/Web/CSS/::part) are exported.

- `root` can be used to override the `background`, set a `padding` or change `font-size` and
  `line-height`.
- `textarea` can be used to change the selection color.
- `code` can be used to change the `code` tag.

```css
shiki-textarea::part(root) {
  padding: 20px;
  background: transparent;
  font-size: 18px;
  line-height: 1.25;
}

shiki-textarea::part(textarea)::selection {
  background: deepskyblue;
}

/* to size it to the container, will remove dead-zones */
shiki-textarea {
  min-height: 100%;
  min-width: 100%;
}
```

The attribute `stylesheet` could be used as a last resort to customize the theme. In the following
example we avoid italics in the rendered coded. The stylesheet is created, cached and reused on the
different `shiki-textarea` instances.

```tsx
<shiki-textarea
  language="tsx"
  theme="andromeeda"
  value="const sum = (a: string, b: string) => a + b"
  editable={true}
  style={{
    '--padding': '10px',
    'font-size': '16pt',
  }}
  stylesheet="code, code * { font-style:normal; }"
  onInput={e => console.log(e.target.value)}
/>
```

## CDN

```tsx
// from solid component
import { setCDN } from 'solid-shiki-textarea'

// Set base-url of CDN directly (defaults to https://esm.sh)
setCDN('https://unpkg.com')

// relative to the root
setCDN('/assets/shiki')

// Or use the callback-form
setCDN((type, id) => `./shiki/${type}/${id}.json`)
```

## Themes & Languages

Both, the languages and themes list are exported as `string[]`.

```tsx
import type { Theme, Language } from 'solid-shiki-textarea/tm'

import { themes, languages } from 'solid-shiki-textarea/tm'
```
