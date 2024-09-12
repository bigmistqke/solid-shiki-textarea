import {
  attribute,
  booleanAttribute,
  element,
  Element,
  ElementAttributes,
  stringAttribute,
} from '@lume/element'
import { createShikiTextarea, LanguageProp, ThemeProp } from './core'
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
    ElementAttributes<ShikiTextareaElement, 'language' | 'theme' | 'value' | 'editable'>,
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

const ShikiTextareaStyleSheet = sheet(css)

@element('shiki-textarea')
class ShikiTextareaElement extends Element {
  @attribute() language: LanguageProp = 'tsx'
  @attribute() theme: ThemeProp = 'andromeeda'
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

    return (
      <ShikiTextarea
        language={this.language}
        theme={this.theme}
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
