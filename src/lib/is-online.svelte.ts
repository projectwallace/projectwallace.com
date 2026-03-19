import { on } from 'svelte/events'
import { browser } from '$app/environment'

export class IsOnline {
	private is_online: boolean

	constructor() {
		this.is_online = $state(typeof navigator === 'undefined' ? true : navigator.onLine)

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
