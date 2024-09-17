import {
  attribute,
  booleanAttribute,
  element,
  Element,
  ElementAttributes,
  stringAttribute,
} from '@lume/element'
import { signal } from 'classy-solid'

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
    ElementAttributes<ShikiTextareaElement, 'language' | 'theme' | 'code' | 'editable'>,
    'onInput' | 'oninput'
  > {
  oninput?: (event: InputEvent & { currentTarget: ShikiTextareaElement }) => any
  onInput?: (event: InputEvent & { currentTarget: ShikiTextareaElement }) => any
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
  @stringAttribute stylesheet = ''
  @booleanAttribute editable = true

  @signal private _value = ''

  textarea: HTMLTextAreaElement = null!

  template = () => {
    const adoptedStyleSheets = this.shadowRoot!.adoptedStyleSheets

    // local component stylesheet
    adoptedStyleSheets.push(ShikiTextareaStyleSheet)

    // user provided stylesheet
    if (this.stylesheet) {
      adoptedStyleSheets.push(sheet(this.stylesheet))
    }

    return (
      <ShikiTextarea
        language={this.language}
        theme={this.theme}
        code={this._value}
        editable={this.editable}
        textareaRef={textarea => (this.textarea = textarea)}
      />
    )
  }

  get value() {
    return this.textarea.value
  }

  set value(value) {
    this._value = value
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
