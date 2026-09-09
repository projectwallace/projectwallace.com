import css_features from '#lib/data/css-features.generated.json'
import type { CssFeature } from '#lib/data/css-feature.js'
import type { CssLocation } from '#lib/css-location.js'
import { EDGE_LAUNCH_DATE } from './group-by-year.js'

export type UsageCounts = {
	features: number
	usages: number
	locations: CssLocation[]
}

export type UsageSummary = {
	widely_available: UsageCounts
	newly_available: UsageCounts
	limited_availability: UsageCounts
}

/**
 * Buckets Baseline-tracked usages by status, for a top-level "how healthy is
 * this stylesheet" table. `features`/`usages` in each bucket count distinct
 * features vs. total occurrences, respectively.
 */
export function summarize_usages(usages: Map<string, CssLocation[]>): UsageSummary {
	let summary: UsageSummary = {
		widely_available: { features: 0, usages: 0, locations: [] },
		newly_available: { features: 0, usages: 0, locations: [] },
		limited_availability: { features: 0, usages: 0, locations: [] }
	}

	for (let [feature_id, locations] of usages) {
		let feature = (css_features as Record<string, CssFeature>)[feature_id]
		if (!feature) {
			continue
		}
		// Edge's own launch stands in for a real support date on CSS old
		// enough to predate it - not a real "since" date, so drop the row
		// (matches the exclusion in group_by_year and the feature table).
		if (feature.baseline_low_date === EDGE_LAUNCH_DATE) {
			continue
		}

		let bucket =
			feature.baseline === 'high'
				? summary.widely_available
				: feature.baseline === 'low'
					? summary.newly_available
					: summary.limited_availability

		bucket.features++
		bucket.usages += locations.length
		bucket.locations = bucket.locations.concat(locations)
	}

	return summary
}
