import css_features from './css-features.generated.json'
import type { CssFeature } from './css-feature.js'
import type { CssLocation } from '#lib/css-location.js'
import type { UsageCounts } from './summarize-usages.js'

/**
 * Stand-in "last browser" date for CSS predating Microsoft Edge - not a real support date, so features
 * carrying it are excluded wherever exact years matter.
 */
export const EDGE_LAUNCH_DATE = '2015-07-29'

/**
 * First year Baseline "widely available" dates can land in, used as the
 * floor for the chart so early years with no features still get a 0 bar.
 */
export const FIRST_BASELINE_YEAR = 2018

/**
 * Counts widely-available features (`features`) and their total usages (`count`) per year, keyed by
 * `baseline_high_date`, dropping non-widely/no-status/Edge-artifact features. Includes every year from
 * FIRST_BASELINE_YEAR onward (even at 0) as a Map, so numeric-looking keys keep insertion order.
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
		// .push() instead of .concat() to avoid new Array allocations all the time
		for (let location of locations) {
			counts.locations.push(location)
		}
		year_counts.set(year, counts)
	}

	let last_year = new Date().getFullYear()

	let by_year = new Map<string, UsageCounts>()
	for (let year = FIRST_BASELINE_YEAR; year <= last_year; year++) {
		by_year.set(String(year), year_counts.get(year) ?? { features: 0, count: 0, locations: [] })
	}

	return by_year
}
