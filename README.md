<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=solid-shiki-textarea&background=tiles&project=%20" alt="solid-shiki-textarea">
</p>

# 📄 solid-shiki-textarea

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)

Textarea with syntax highlighting powered by [solid-js](https://github.com/solidjs/solid) and [shiki](https://github.com/shikijs/shiki).

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
  style?: JSX.CSSProperties
  theme:
    | Promise<ThemeRegistrationRaw | ThemeRegistration>
    | Promise<{ default: ThemeRegistrationRaw | ThemeRegistration }>
    | ThemeRegistrationRaw
    | ThemeRegistration
  value: string
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
    onInput={e => console.log(e.target.value)}
  />
)
```

## Custom Element

We also export a custom-element wrapper `<shiki-textarea/>` powered by [@lume/element](https://github.com/lume/element)

### Types

```tsx
interface ShikiTextareaAttributes extends {
  lang?: BundledLanguage
  cdn?: string
  theme?: BundledTheme
  value?: string
}
```

### Usage

```tsx
import { registerShikiTextarea } from 'solid-shiki-textarea/custom-element'

// Noop to prevent <shiki-textarea/> from being treeshaken
registerShikiTextarea()

export default () => (
  <shiki-textarea
    lang="tsx"
    theme="andromeeda"
    value="const sum = (a: string, b: string) => a + b"
    style={{
      '--padding': '10px',
      '--font-size': '16pt',
    }}
    onInput={e => console.log(e.target.value)}
  />
)
```

It resolves the theme and lang from a cdn, defaulted to `esm.sh`.

**Note**

> I have not yet found another cdn that can resolve shiki's `theme/lang` besides `esm.sh`. It also takes quite a bit before the `theme/lang` is resolved, so maybe there is a better solution _(PRs welcome!)_

## CSS Variables

The following css-variables are available:

- `--padding`
- `--padding-top`
- `--padding-bottom`
- `--padding-left`
- `--padding-right`
- `--width`
- `--height`
- `--font-size`

For the solid-component, these can also be set directly from the component's `style`-prop.
