import { LitElement, html, css } from 'lit'

/** <pw-meter value="0.5" max="1">: a themeable <meter>. Style it with --meter-color, --meter-bg and --meter-height. */
export class PwMeter extends LitElement {
	static properties = {
		value: { type: Number },
		min: { type: Number },
		max: { type: Number }
	}

	static styles = css`
		:host {
			display: inline-block;
			inline-size: 100%;
			min-inline-size: 1rem;
			block-size: var(--meter-height, 1em);
			vertical-align: middle;
		}

		meter {
			--_meter-color: var(--meter-color, light-dark(var(--accent), var(--accent-500)));
			--_meter-bg: var(--meter-bg, transparent);
			inline-size: 100%;
			block-size: 100%;
			background: var(--_meter-bg);
		}

		meter::-webkit-meter-bar {
			background: var(--_meter-bg);
		}

		meter::-webkit-meter-optimum-value {
			background: var(--_meter-color);
		}

		meter::-moz-meter-bar {
			background: var(--_meter-color);
		}
	`

	declare value: number
	declare min: number
	declare max: number

	constructor() {
		super()
		this.value = 0
		this.min = 0
		this.max = 1
	}

	render() {
		return html`<meter .value=${this.value} .min=${this.min} .max=${this.max}></meter>`
	}
}

if (!customElements.get('pw-meter')) {
	customElements.define('pw-meter', PwMeter)
}

declare global {
	interface HTMLElementTagNameMap {
		'pw-meter': PwMeter
	}
}
