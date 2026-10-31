export const themes = ['dark', 'light', 'system', 'naked'] as const

export type Theme = (typeof themes)[number]

export function validate_theme(theme?: string): theme is Theme {
	return themes.includes(theme as Theme)
}

export function apply_theme(theme: Theme) {
	document.documentElement.dataset.theme = theme
}

let save_timer: ReturnType<typeof setTimeout>

/** Persist the theme in a cookie (via the API), debounced so rapid changes result in one request */
export function save_theme(theme: Theme) {
	clearTimeout(save_timer)
	save_timer = setTimeout(() => {
		fetch('/api/theme', {
			method: 'POST',
			headers: {
				'Content-Type': 'text/plain'
			},
			body: theme
		})
	}, 300)
}

/** Apply and persist a theme */
export function set_theme(theme: Theme) {
	apply_theme(theme)
	save_theme(theme)
}

/** Flip between light and dark. Any other theme ('system', 'naked') is treated as whatever the OS prefers. */
export function toggle_theme() {
	const current = document.documentElement.dataset.theme

	if (current === 'light') {
		return set_theme('dark')
	}
	if (current === 'dark') {
		return set_theme('light')
	}

	const prefers_light = matchMedia('(prefers-color-scheme: light)').matches
	set_theme(prefers_light ? 'dark' : 'light')
}

/**
 * Determine the theme that is currently in effect on the page.
 * Respects a cookie-based theme already set by the inline script in <head>;
 * without a preference ('system'), resolve to an actual light/dark theme and apply it.
 */
export function resolve_current_theme(prefers_light: boolean): Theme {
	const dom_theme = document.documentElement.dataset.theme

	if (validate_theme(dom_theme) && dom_theme !== 'system') {
		return dom_theme
	}

	const resolved = prefers_light ? 'light' : 'dark'
	apply_theme(resolved)
	return resolved
}

/** Call `callback` whenever the theme on the page changes. Returns a function to stop observing. */
export function on_theme_change(callback: (theme: Theme) => void) {
	const observer = new MutationObserver(() => {
		const dom_theme = document.documentElement.dataset.theme
		if (validate_theme(dom_theme)) {
			callback(dom_theme)
		}
	})
	observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
	return () => observer.disconnect()
}
