import { LitElement, html, nothing } from 'lit'
import { format_filesize } from '#lib/format-filesize.ts'

/**
 * <pw-file-size>37560</pw-file-size> renders "37.6 kB".
 * The number of bytes is the (slotted) text content, which is also the no-JS fallback.
 */
export class PwFileSize extends LitElement {
	static properties = { _bytes: { state: true } }

	declare _bytes: number | undefined

	#update_bytes = (event: Event) => {
		let slot = event.target as HTMLSlotElement
		let text = slot
			.assignedNodes({ flatten: true })
			.map((node) => node.textContent)
			.join('')
			.trim()
		let bytes = text === '' ? NaN : Number(text)
		this._bytes = Number.isFinite(bytes) ? bytes : undefined
	}

	render() {
		// Not a number? Show the slotted text as is instead of hiding it
		return html`<slot ?hidden=${this._bytes !== undefined} @slotchange=${this.#update_bytes}></slot>${
				this._bytes === undefined ? nothing : format_filesize(this._bytes)
			}`
	}
}

if (!customElements.get('pw-file-size')) {
	customElements.define('pw-file-size', PwFileSize)
}

declare global {
	interface HTMLElementTagNameMap {
		'pw-file-size': PwFileSize
	}
}
