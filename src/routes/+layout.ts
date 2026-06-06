import { browser } from '$app/environment'
import type { Theme } from '$lib/theme'

export const prerender = true
export const trailingSlash = 'never'

export function load() {
	if (browser) {
		return {
			theme: document.documentElement.dataset.theme as Theme,
			allow_analytics: window.location.hostname === 'www.projectwallace.com'
		}
	}
	return {}
}
