import { isSupported } from '@oddbird/popover-polyfill/fn'
import '$lib/polyfills/request-idle-callback'
import '$lib/polyfills/scheduler-yield'

export const init = async () => {
	// Polyfill popover if necessary
	if (!isSupported()) {
		console.warn('Popover API not supported in this browser, applying polyfill')
		await import('@oddbird/popover-polyfill/fn').then(({ apply }) => apply())
	}
}
