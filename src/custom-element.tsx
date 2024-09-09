import { element, Element, ElementAttributes, stringAttribute } from '@lume/element'
import { BundledLanguage, BundledTheme } from 'shiki/types.mjs'
import { createResource } from 'solid-js'
import { createShikiTextarea } from './core'
import classnames from './index.module.css?classnames'
import css from './index.module.css?raw'

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
/*                                 Custom Element                                 */
/*                                                                                */
/**********************************************************************************/

const ShikiTextarea = createShikiTextarea(Object.fromEntries(classnames.map(name => [name, name])))

@element('shiki-textarea')
class ShikiTextareaElement extends Element {
  @stringAttribute lang = 'tsx' as BundledLanguage
  @stringAttribute cdn = 'esm.sh'
  @stringAttribute theme = 'andromeeda' as BundledTheme
  @stringAttribute value = ''

  template = () => {
    const [theme] = createResource(
      () => this.theme,
      theme =>
        import(/* @vite-ignore */ `https://${this.cdn}/shiki/themes/${theme}`).then(
          module => module.default,
        ),
    )
    const [lang] = createResource(
      () => this.lang,
      lang =>
        import(/* @vite-ignore */ `https://${this.cdn}/shiki/langs/${lang}`).then(
          module => module.default,
        ),
    )

    return <ShikiTextarea lang={lang()} theme={theme()} value={this.value} />
  }

  static css = css
}

/**
 * NOOP to prevent <shiki-textarea/> to be treeshaken out.
 */
export function registerShikiTextarea() {
  if (!customElements.get('shiki-textarea')) {
    customElements.define('shiki-textarea', ShikiTextareaElement)
  }
}
