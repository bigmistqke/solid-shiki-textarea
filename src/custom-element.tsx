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
import { Language, Theme } from './tm'
import { Accessor, createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import { LanguageRegistration, ThemeRegistration, ThemeRegistrationRaw } from 'shiki/types.mjs'

/**********************************************************************************/
/*                                                                                */
/*                                 Custom Element                                 */
/*                                                                                */
/**********************************************************************************/

const ShikiTextarea = createShikiTextarea(Object.fromEntries(classnames.map(name => [name, name])))

const ShikiTextareaStyleSheet = sheet(css)

type ShikiTextareaAttributes = 'language' | 'theme' | 'stylesheet' | 'editable' | 'value'

@element('shiki-textarea')
export class ShikiTextareaElement extends Element {
  @stringAttribute language: Language = 'tsx'
  @attribute() theme: Theme = 'andromeeda'
  @stringAttribute stylesheet = ''
  @booleanAttribute editable = true
  @stringAttribute value = ''
  @stringAttribute grammarTemplate = 'https://esm.sh/tm-grammars/grammars/{{language}}.json'
  @stringAttribute themeTemplate = 'https://esm.sh/tm-themes/themes/{{theme}}.json'

  @signal accessor #languageLoading = true
  @signal accessor #themeLoading = true

  /** A signal alternative to "load" DOM events */
  @signal loading = true

  textarea: HTMLTextAreaElement = null!

  template = () => {
    const adoptedStyleSheets = this.shadowRoot!.adoptedStyleSheets

    // local component stylesheet
    adoptedStyleSheets.push(ShikiTextareaStyleSheet)

    // user provided stylesheet
    if (this.stylesheet) {
      adoptedStyleSheets.push(sheet(this.stylesheet))
    }

    this.createEffect(() => {
      const url = createMemo(() => this.grammarTemplate.replace('{{language}}', this.language))
      const registrations = languageRegistrations(url)

      createEffect(() => {
        if (!registrations()) return
        this.#languageLoading = false
        onCleanup(() => (this.#languageLoading = true))
      })
    })

    this.createEffect(() => {
      const url = createMemo(() => this.themeTemplate.replace('{{theme}}', this.theme))
      const registration = themeRegistration(url)

      createEffect(() => {
        if (!registration()) return
        this.#themeLoading = false
        onCleanup(() => (this.#themeLoading = true))
      })
    })

    this.createEffect(() => {
      // Replace this with @memo from the next classy-solid version
      this.loading = this.#languageLoading || this.#themeLoading

      if (!this.loading) this.dispatchEvent(new Event('load'))
    })

    return (
      <ShikiTextarea
        language={this.language}
        theme={this.theme}
        code={this.value}
        editable={this.editable}
        textareaRef={textarea => (this.textarea = textarea)}
        onInput={() => (this.value = this.textarea.value)}
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

function languageRegistrations(url: Accessor<string>) {
  const [registrations, setRegistrations] = createSignal<LanguageRegistration[] | null>(null)

  createEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal
    const registrationsPromise = fetch(url(), { signal })
      .then(value => value.json())
      .then(value => [value]) as Promise<LanguageRegistration[]>

    registrationsPromise.then(regs => !signal.aborted && setRegistrations(regs))

    onCleanup(() => {
      controller.abort()
      setRegistrations(null)
    })
  })

  return registrations
}

// Similar to languageRegistrations, but for theme. An async pattern could be extracted...
function themeRegistration(url: Accessor<string>) {
  const [registration, setRegistration] = createSignal<
    ThemeRegistration | ThemeRegistrationRaw | null
  >(null)

  createEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal
    const registrationPromise = fetch(url(), { signal }).then(value => value.json()) as Promise<
      ThemeRegistration | ThemeRegistrationRaw
    >

    registrationPromise.then(reg => !signal.aborted && setRegistration(reg))

    onCleanup(() => {
      controller.abort()
      setRegistration(null)
    })
  })

  return registration
}

/**********************************************************************************/
/*                                                                                */
/*                                      Types                                     */
/*                                                                                */
/**********************************************************************************/

declare module 'solid-js/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'shiki-textarea': ElementAttributes<ShikiTextareaElement, ShikiTextareaAttributes>
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'shiki-textarea': ElementAttributes<ShikiTextareaElement, ShikiTextareaAttributes>
    }
  }
}
