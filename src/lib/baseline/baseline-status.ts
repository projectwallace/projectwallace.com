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
 * a feature. A family counts as supported if any of its variants does,
 * since a Baseline feature only ends up "limited" when at least one browser
 * lacks support - not necessarily every variant of every browser.
 */
export function is_browser_supported(
	feature: CssFeature,
	availability: BaselineAvailability,
	browser_ids: BrowserId[]
): boolean {
	if (availability === 'limited') {
		return browser_ids.some((id) => feature.support?.includes(id))
	}
	return true
}
