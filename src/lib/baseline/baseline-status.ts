import type { CssFeature } from './css-feature.js'
import type { BrowserId } from './browsers.js'

export type BaselineAvailability = 'widely' | 'newly' | 'limited'

export function get_baseline_availability(feature: CssFeature): BaselineAvailability {
	if (feature.baseline === 'high') {
		return 'widely'
	}
	if (feature.baseline === 'low') {
		return 'newly'
	}
	return 'limited'
}

/**
 * Whether a browser family (e.g. Chrome desktop + Chrome Android) supports
 * a feature. A family only counts as supported if every one of its variants
 * does - e.g. Safari desktop supporting a feature that Safari iOS doesn't
 * is still partial support, not a green check for "Safari".
 */
export function is_browser_supported(
	feature: CssFeature,
	availability: BaselineAvailability,
	browser_ids: BrowserId[]
): boolean {
	if (availability === 'limited') {
		return browser_ids.every((id) => feature.support?.includes(id))
	}
	return true
}
