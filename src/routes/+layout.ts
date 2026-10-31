import { browser } from '$app/env'
import type { Theme } from '#lib/theme.ts'
import { SITE_HOSTNAME } from '#lib/site.ts'

export const prerender = true
export const trailingSlash = 'never'

export function load() {
	if (browser) {
		return {
			theme: document.documentElement.dataset.theme as Theme,
			allow_analytics: window.location.hostname === SITE_HOSTNAME
		}
	}
	return {}
}
