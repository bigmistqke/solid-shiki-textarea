import { element, Element, ElementAttributes, stringAttribute } from '@lume/element'
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

/**********************************************************************************/
/*                                                                                */
/*                                      Types                                     */
/*                                                                                */
/**********************************************************************************/

interface ShikiTextareaAttributes
  extends Omit<
    ElementAttributes<ShikiTextareaElement, 'lang' | 'theme' | 'value'>,
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

const THEME_CACHE = new Cache<Promise<ThemeRegistration>>()
const LANG_CACHE = new Cache<Promise<LanguageRegistration>>()

@element('shiki-textarea')
class ShikiTextareaElement extends Element {
  @stringAttribute lang = 'tsx' as BundledLanguage
  @stringAttribute theme = 'andromeeda' as BundledTheme
  @stringAttribute value = ''

  template = () => {
    const [theme] = createResource(
      () => this.theme,
      async theme => {
        const url =
          typeof CDN === 'string' ? `${CDN}/tm-themes/themes/${theme}.json` : CDN('theme', theme)
        onCleanup(() => THEME_CACHE.cleanup(url))
        return THEME_CACHE.add(url, () =>
          fetch(/* @vite-ignore */ url).then(result => result.json()),
        )
      },
    )
    const [lang] = createResource(
      () => this.lang,
      async lang => {
        const url =
          typeof CDN === 'string' ? `${CDN}/tm-grammars/grammars/${lang}.json` : CDN('lang', lang)
        onCleanup(() => LANG_CACHE.cleanup(url))
        return LANG_CACHE.add(url, () =>
          fetch(/* @vite-ignore */ url)
            .then(result => result.json())
            .then(result => [result] as any),
        )
      },
    )

    return <ShikiTextarea lang={lang()} theme={theme()} value={this.value} />
  }

  static css = css
}

// NOTE:  <shiki-textarea/> is already defined with lume's @element() decorator.
//        This line will always be NOOP, but is needed for rollup not to treeshake
//        the custom-element declaration out of the bundle.
if (!customElements.get('shiki-textarea')) {
  customElements.define('shiki-textarea', ShikiTextareaElement)
}
