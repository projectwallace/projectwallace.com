import css_features from './css-features.generated.json'
import type { CssFeature } from './css-feature.js'
import type { CssLocation } from '#lib/css-location.js'
import type { UsageCounts } from './summarize-usages.js'

/**
 * Baseline's "newly available" date is when the last of the 5 tracked
 * browsers gained support. For CSS that predates Microsoft Edge, that
 * browser didn't exist yet - so Edge's own release date gets used as a
 * stand-in "last browser" date instead of a real support date. That's not
 * when the feature actually became available, just an artifact of Edge's
 * launch, so features carrying this date are excluded wherever exact years
 * matter (the chart here, and the usage table's date columns).
 */
export const EDGE_LAUNCH_DATE = '2015-07-29'

/**
 * First year Baseline "widely available" dates can land in, used as the
 * floor for the chart so early years with no features still get a 0 bar.
 */
export const FIRST_BASELINE_YEAR = 2018

/**
 * Counts distinct widely-available features per year (`features`) and their
 * total occurrences in the stylesheet (`usages`), using the year they became
 * widely available (`baseline_high_date`). Features that aren't widely
 * available yet, that have no Baseline status, or whose date is just the
 * Edge-launch artifact (see above) are dropped. Every year from
 * FIRST_BASELINE_YEAR through the latest year with data is included, even
 * when its counts are 0. Returns a Map (not a plain object) so callers
 * control bar order - object keys that look like numbers get sorted before
 * non-numeric ones regardless of insertion order.
 */
export function group_by_year(usages: Map<string, CssLocation[]>): Map<string, UsageCounts> {
	let year_counts = new Map<number, UsageCounts>()

	for (let [feature_id, locations] of usages) {
		let feature = (css_features as Record<string, CssFeature>)[feature_id]

		if (!feature || feature.baseline !== 'high' || !feature.baseline_high_date) {
			continue
		}
		if (feature.baseline_low_date === EDGE_LAUNCH_DATE) {
			continue
		}

		let year = new Date(feature.baseline_high_date).getFullYear()
		let counts = year_counts.get(year) ?? { features: 0, count: 0, locations: [] }
		counts.features++
		counts.count += locations.length
		counts.locations = counts.locations.concat(locations)
		year_counts.set(year, counts)
	}

	let last_year = new Date().getFullYear()

	let by_year = new Map<string, UsageCounts>()
	for (let year = FIRST_BASELINE_YEAR; year <= last_year; year++) {
		by_year.set(String(year), year_counts.get(year) ?? { features: 0, count: 0, locations: [] })
	}

	return by_year
}
