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

// relative to the root
setCDN('/assets/shiki')

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

For the solid-component, these can also be set directly from the component's `style`-prop:

```tsx
<ShikiTextarea style={{padding: '10px'}}>
// instead of
<ShikiTextarea style={{'--padding': '10px'}}>
```

## Language and Themes List

Bit complicated to export the themes and languages list without importing everything. So the
following lists are provided as arrays ready to use.

```tsx
// list from https://github.com/shikijs/textmate-grammars-themes/tree/main/packages/tm-themes/themes
const themes = [
  'andromeeda',
  'aurora-x',
  'ayu-dark',
  'catppuccin-frappe',
  'catppuccin-latte',
  'catppuccin-macchiato',
  'catppuccin-mocha',
  'dark-plus',
  'dracula-soft',
  'dracula',
  'everforest-dark',
  'everforest-light',
  'github-dark-default',
  'github-dark-dimmed',
  'github-dark-high-contrast',
  'github-dark',
  'github-light-default',
  'github-light-high-contrast',
  'github-light',
  'houston',
  'laserwave',
  'light-plus',
  'material-theme-darker',
  'material-theme-lighter',
  'material-theme-ocean',
  'material-theme-palenight',
  'material-theme',
  'min-dark',
  'min-light',
  'monokai',
  'night-owl',
  'nord',
  'one-dark-pro',
  'one-light',
  'plastic',
  'poimandres',
  'red',
  'rose-pine-dawn',
  'rose-pine-moon',
  'rose-pine',
  'slack-dark',
  'slack-ochin',
  'snazzy-light',
  'solarized-dark',
  'solarized-light',
  'synthwave-84',
  'tokyo-night',
  'vesper',
  'vitesse-black',
  'vitesse-dark',
  'vitesse-light',
]

// list from https://github.com/shikijs/textmate-grammars-themes/tree/main/packages/tm-grammars/grammars
const languages = [
  'abap',
  'actionscript-3',
  'ada',
  'angular-expression',
  'angular-html',
  'angular-inline-style',
  'angular-inline-template',
  'angular-let-declaration',
  'angular-template-blocks',
  'angular-template',
  'angular-ts',
  'apache',
  'apex',
  'apl',
  'applescript',
  'ara',
  'asciidoc',
  'asm',
  'astro',
  'awk',
  'ballerina',
  'bat',
  'beancount',
  'berry',
  'bibtex',
  'bicep',
  'blade',
  'c',
  'cadence',
  'clarity',
  'clojure',
  'cmake',
  'cobol',
  'codeowners',
  'codeql',
  'coffee',
  'common-lisp',
  'coq',
  'cpp-macro',
  'cpp',
  'crystal',
  'csharp',
  'css',
  'csv',
  'cue',
  'cypher',
  'd',
  'dart',
  'dax',
  'desktop',
  'diff',
  'docker',
  'dotenv',
  'dream-maker',
  'edge',
  'elixir',
  'elm',
  'emacs-lisp',
  'erb',
  'erlang',
  'es-tag-css',
  'es-tag-glsl',
  'es-tag-html',
  'es-tag-sql',
  'es-tag-xml',
  'fennel',
  'fish',
  'fluent',
  'fortran-fixed-form',
  'fortran-free-form',
  'fsharp',
  'gdresource',
  'gdscript',
  'gdshader',
  'genie',
  'gherkin',
  'git-commit',
  'git-rebase',
  'gleam',
  'glimmer-js',
  'glimmer-ts',
  'glsl',
  'gnuplot',
  'go',
  'graphql',
  'groovy',
  'hack',
  'haml',
  'handlebars',
  'haskell',
  'haxe',
  'hcl',
  'hjson',
  'hlsl',
  'html-derivative',
  'html',
  'http',
  'hxml',
  'hy',
  'imba',
  'ini',
  'java',
  'javascript',
  'jinja-html',
  'jinja',
  'jison',
  'json',
  'json5',
  'jsonc',
  'jsonl',
  'jsonnet',
  'jssm',
  'jsx',
  'julia',
  'kotlin',
  'kusto',
  'latex',
  'lean',
  'less',
  'liquid',
  'log',
  'logo',
  'lua',
  'luau',
  'make',
  'markdown-vue',
  'markdown',
  'marko',
  'matlab',
  'mdc',
  'mdx',
  'mermaid',
  'mojo',
  'move',
  'narrat',
  'nextflow',
  'nginx',
  'nim',
  'nix',
  'nushell',
  'objective-c',
  'objective-cpp',
  'ocaml',
  'pascal',
  'perl',
  'php',
  'plsql',
  'po',
  'postcss',
  'powerquery',
  'powershell',
  'prisma',
  'prolog',
  'proto',
  'pug',
  'puppet',
  'purescript',
  'python',
  'qml',
  'qmldir',
  'qss',
  'r',
  'racket',
  'raku',
  'razor',
  'reg',
  'regexp',
  'rel',
  'riscv',
  'rst',
  'ruby',
  'rust',
  'sas',
  'sass',
  'scala',
  'scheme',
  'scss',
  'shaderlab',
  'shellscript',
  'shellsession',
  'smalltalk',
  'solidity',
  'soy',
  'sparql',
  'splunk',
  'sql',
  'ssh-config',
  'stata',
  'stylus',
  'svelte',
  'swift',
  'system-verilog',
  'systemd',
  'tasl',
  'tcl',
  'templ',
  'terraform',
  'tex',
  'toml',
  'ts-tags',
  'tsv',
  'tsx',
  'turtle',
  'twig',
  'typescript',
  'typespec',
  'typst',
  'v',
  'vala',
  'vb',
  'verilog',
  'vhdl',
  'viml',
  'vue-directives',
  'vue-html',
  'vue-interpolations',
  'vue-sfc-style-variable-injection',
  'vue',
  'vyper',
  'wasm',
  'wenyan',
  'wgsl',
  'wikitext',
  'wolfram',
  'xml',
  'xsl',
  'yaml',
  'zenscript',
  'zig',
]
```
