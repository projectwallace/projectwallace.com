import { on } from 'svelte/events'
import { browser } from '$app/environment'

export class IsOnline {
	private is_online: boolean

	constructor() {
		// We assume we're starting out online, otherwise the page with this class couldn't have loaded at all.
		// This assumption prevents a quick online/offline/online jump on page loading, wich causes layout shifts.
		this.is_online = $state(true)

		$effect(() => {
			if (browser) {
				return on(window, 'online', () => {
					this.is_online = true
				})
			}
		})

		$effect(() => {
			if (browser) {
				return on(window, 'offline', () => {
					this.is_online = false
				})
			}
		})
	}

	get current(): boolean {
		return this.is_online
	}
}
