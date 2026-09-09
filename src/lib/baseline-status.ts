import type { CssFeature } from '#lib/data/css-feature.js'

export type BaselineAvailability = 'widely' | 'newly' | 'limited'

export function get_baseline_availability(feature: CssFeature): BaselineAvailability {
	return feature.baseline === 'high' ? 'widely' : feature.baseline === 'low' ? 'newly' : 'limited'
}

export function is_browser_supported(
	feature: CssFeature,
	availability: BaselineAvailability,
	browser_id: string
): boolean {
	if (availability === 'limited') {
		return feature.support?.includes(browser_id) ?? false
	}
	return true
}
