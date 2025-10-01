import { on } from 'svelte/events'

export class IsOnline {
	private is_online: boolean

	constructor() {
		this.is_online = $state(typeof navigator === 'undefined' ? true : navigator.onLine)

		$effect(() => {
			if (typeof window !== 'undefined') {
				return on(window, 'online', () => {
					this.is_online = true
				})
			}
		})

		$effect(() => {
			if (typeof window !== 'undefined') {
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