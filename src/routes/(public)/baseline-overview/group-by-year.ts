import css_features from '#lib/data/css-features.generated.json'
import type { CssFeature } from '#lib/data/css-feature.js'

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
 * Counts distinct widely-available features per year, using the year they
 * became widely available (`baseline_high_date`). Features that aren't
 * widely available yet, that have no Baseline status, or whose date is just
 * the Edge-launch artifact (see above) are dropped. Returns a Map (not a
 * plain object) so callers control bar order - object keys that look like
 * numbers get sorted before non-numeric ones regardless of insertion order.
 */
export function group_by_year(usages: Map<string, unknown>): Map<string, number> {
	let year_counts = new Map<number, number>()

	for (let feature_id of usages.keys()) {
		let feature = (css_features as Record<string, CssFeature>)[feature_id]
		if (!feature || feature.baseline !== 'high' || !feature.baseline_high_date) continue
		if (feature.baseline_low_date === EDGE_LAUNCH_DATE) continue

		let year = new Date(feature.baseline_high_date).getFullYear()
		year_counts.set(year, (year_counts.get(year) ?? 0) + 1)
	}

	let by_year = new Map<string, number>()
	for (let [year, count] of Array.from(year_counts).sort(([a], [b]) => a - b)) {
		by_year.set(String(year), count)
	}

	return by_year
}
