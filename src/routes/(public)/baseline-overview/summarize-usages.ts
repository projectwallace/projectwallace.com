import css_features from '#lib/data/css-features.generated.json'
import type { CssFeature } from '#lib/data/css-feature.js'
import type { CssLocation } from '#lib/css-location.js'

export type UsageCounts = {
	features: number
	usages: number
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
		widely_available: { features: 0, usages: 0 },
		newly_available: { features: 0, usages: 0 },
		limited_availability: { features: 0, usages: 0 }
	}

	for (let [feature_id, locations] of usages) {
		let feature = (css_features as Record<string, CssFeature>)[feature_id]
		if (!feature) continue

		let bucket =
			feature.baseline === 'high'
				? summary.widely_available
				: feature.baseline === 'low'
					? summary.newly_available
					: summary.limited_availability

		bucket.features++
		bucket.usages += locations.length
	}

	return summary
}
