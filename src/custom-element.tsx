import {
  booleanAttribute,
  element,
  Element,
  ElementAttributes,
  stringAttribute,
} from '@lume/element'
import {
  BundledLanguage,
  BundledTheme,
  LanguageRegistration,
  ThemeRegistration,
} from 'shiki/types.mjs'
import { createResource, onCleanup } from 'solid-js'
import { createShikiTextarea } from './core'
import classnames from './index.module.css?classnames'
import css from './index.module.css?raw'
import { Cache } from './utils/cache'
import { sheet } from './utils/sheet.js'

/**********************************************************************************/
/*                                                                                */
/*                                      Types                                     */
/*                                                                                */
/**********************************************************************************/

interface ShikiTextareaAttributes
  extends Omit<
    ElementAttributes<ShikiTextareaElement, 'lang' | 'theme' | 'value' | 'editable'>,
    'onInput' | 'oninput'
  > {
  oninput?: (event: InputEvent & { target: HTMLTextAreaElement }) => any
  onInput?: (event: InputEvent & { target: HTMLTextAreaElement }) => any
}

declare module 'solid-js/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'shiki-textarea': ShikiTextareaAttributes
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'shiki-textarea': ShikiTextareaAttributes
    }
  }
}

/**********************************************************************************/
/*                                                                                */
/*                                     Set Cdn                                    */
/*                                                                                */
/**********************************************************************************/

type Cdn = string | ((type: 'lang' | 'theme', id: string) => string)
let CDN: Cdn = 'https://esm.sh'

/**
 * Sets the CDN from which the theme/lang of <shiki-textarea/> is fetched.
 *
 * Accepts as arguments
 * - url: string
 * - callback: (type: 'lang' | 'theme', id: string) => string
 *
 * When given an url, this will be used to fetch
 * - `${cdn}/tm-themes/themes/${theme}.json` for the `themes`
 * - `${cdn}/tm-grammars/grammars/${grammar}.json` for the `langs`
 *
 * When given a callback, the returned string will be used to fetch.
 */
export function setCDN(cdn: Cdn) {
  CDN = cdn
}

/**********************************************************************************/
/*                                                                                */
/*                                 Custom Element                                 */
/*                                                                                */
/**********************************************************************************/

const ShikiTextarea = createShikiTextarea(Object.fromEntries(classnames.map(name => [name, name])))

const THEME_CACHE = new Cache<Promise<ThemeRegistration>>()
const LANG_CACHE = new Cache<Promise<LanguageRegistration>>()

const ShikiTextareaStyleSheet = sheet(css)

@element('shiki-textarea')
class ShikiTextareaElement extends Element {
  @stringAttribute lang = 'tsx' as BundledLanguage
  @stringAttribute theme = 'andromeeda' as BundledTheme
  @stringAttribute value = ''
  @stringAttribute stylesheet = ''
  @booleanAttribute editable = true

  template = () => {
    // styles
    const adoptedStyleSheets = this.shadowRoot!.adoptedStyleSheets

    adoptedStyleSheets.push(ShikiTextareaStyleSheet)

    if (this.stylesheet) {
      adoptedStyleSheets.push(sheet(this.stylesheet))
    }

    // copy event from shadowRoot to local instance
    this.shadowRoot.addEventListener('input', e => {
      this.value = this.shadowRoot.value
    })

    // theme
    const [theme] = createResource(
      () => this.theme,
      async theme => {
        const url =
          typeof CDN === 'string' ? `${CDN}/tm-themes/themes/${theme}.json` : CDN('theme', theme)
        onCleanup(() => THEME_CACHE.cleanup(url))
        return THEME_CACHE.add(url, () =>
          fetch(/* @vite-ignore */ url)
            .then(result => result.json())
            .catch(console.error),
        )
      },
    )

    // lang
    const [lang] = createResource(
      () => this.lang,
      async lang => {
        const url =
          typeof CDN === 'string' ? `${CDN}/tm-grammars/grammars/${lang}.json` : CDN('lang', lang)
        onCleanup(() => LANG_CACHE.cleanup(url))
        return LANG_CACHE.add(url, () =>
          fetch(/* @vite-ignore */ url)
            .then(result => result.json())
            .then(result => [result] as any)
            .catch(console.error),
        )
      },
    )

    return (
      <ShikiTextarea
        lang={lang() as any}
        theme={theme() as any}
        value={this.value}
        editable={this.editable}
      />
    )
  }
}

// NOTE:  <shiki-textarea/> is already defined with lume's @element() decorator.
//        register is a NOOP, but is needed for rollup not to treeshake
//        the custom-element declaration out of the bundle.
export function register() {
  if (!customElements.get('shiki-textarea')) {
    customElements.define('shiki-textarea', ShikiTextareaElement)
  }
}
