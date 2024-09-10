import { element, Element, ElementAttributes, stringAttribute } from '@lume/element'
import { BundledLanguage, BundledTheme } from 'shiki/types.mjs'
import { createResource } from 'solid-js'
import { createShikiTextarea } from './core'
import classnames from './index.module.css?classnames'
import css from './index.module.css?raw'
import { sheet } from './utils/sheet.js'

/**********************************************************************************/
/*                                                                                */
/*                                      Types                                     */
/*                                                                                */
/**********************************************************************************/

interface ShikiTextareaAttributes
  extends Omit<
    ElementAttributes<ShikiTextareaElement, 'cdn' | 'lang' | 'theme' | 'value'>,
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

export function setCdn(cdn: Cdn) {
  CDN = cdn
}

/**********************************************************************************/
/*                                                                                */
/*                                 Custom Element                                 */
/*                                                                                */
/**********************************************************************************/

const ShikiTextarea = createShikiTextarea(Object.fromEntries(classnames.map(name => [name, name])))

const ShikiTextareaStyleSheet = sheet(css)

@element('shiki-textarea')
class ShikiTextareaElement extends Element {
  @stringAttribute lang = 'tsx' as BundledLanguage
  @stringAttribute theme = 'andromeeda' as BundledTheme
  @stringAttribute value = ''
  @stringAttribute stylesheet = ''

  template = () => {
    const adoptedStyleSheets = this.shadowRoot.adoptedStyleSheets

    adoptedStyleSheets.push(ShikiTextareaStyleSheet)

    if (this.stylesheet) {
      adoptedStyleSheets.push(sheet(this.stylesheet))
    }

    const [theme] = createResource(
      () => this.theme,
      async theme => {
        const url =
          typeof CDN === 'string' ? `${CDN}/tm-themes/themes/${theme}.json` : CDN('theme', theme)
        return fetch(/* @vite-ignore */ url).then(result => result.json())
      },
    )
    const [lang] = createResource(
      () => this.lang,
      async lang => {
        const url =
          typeof CDN === 'string' ? `${CDN}/tm-grammars/grammars/${lang}.json` : CDN('lang', lang)
        if (typeof url === 'string') {
          return fetch(/* @vite-ignore */ url)
            .then(result => result.json())
            .then(json => [json])
        }
        return url
      },
    )

    return <ShikiTextarea lang={lang()} theme={theme()} value={this.value} />
  }
}

// NOTE:  <shiki-textarea/> is already defined with lume's @element() decorator.
//        This line will always be NOOP, but is needed for rollup not to treeshake
//        the custom-element declaration out of the bundle.
if (!customElements.get('shiki-textarea')) {
  customElements.define('shiki-textarea', ShikiTextareaElement)
}
