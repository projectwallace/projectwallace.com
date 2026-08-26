import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import data from 'web-features/data.json' with { type: 'json' }
import type { Baseline, CssFeature } from '../src/lib/data/css-feature.js'

type WebFeaturesData = {
	features: typeof import('web-features').features
	groups: Record<string, { name: string; parent?: string }>
}

const { features, groups } = data as WebFeaturesData

// The "css" group is just the root of a tree (css > selectors, css >
// container-queries, etc). A feature belongs to CSS if its group is "css"
// or descends from it, so walk the parent chain to collect every group id
// under that root.
const css_group_ids = new Set(['css'])
for (let added = true; added; ) {
	added = false
	for (const [id, group] of Object.entries(groups)) {
		if (group.parent && css_group_ids.has(group.parent) && !css_group_ids.has(id)) {
			css_group_ids.add(id)
			added = true
		}
	}
}

const css_features: Record<string, CssFeature> = {}
const compat_keys: Record<string, string> = {}

for (const [id, feature] of Object.entries(features)) {
	if (feature.kind !== 'feature' || !feature.group) {
		continue
	}

	let feature_groups = Array.isArray(feature.group) ? feature.group : [feature.group]
	if (!feature_groups.some((group) => css_group_ids.has(group))) {
		continue
	}

	let baseline = feature.status.baseline as Baseline

	css_features[id] = {
		name: feature.name,
		baseline,
		baseline_low_date: feature.status.baseline_low_date,
		baseline_high_date: feature.status.baseline_high_date,
		// Only features with limited availability need this - for
		// newly/widely-available ones, the baseline dates already say enough.
		support: baseline === false ? Object.keys(feature.status.support ?? {}) : undefined
	}

	// Only `css.*` compat keys can be matched against a parsed stylesheet,
	// so `api.*`/`html.*`/`svg.*` entries are dropped here.
	for (const compat_feature of feature.compat_features ?? []) {
		if (compat_feature.startsWith('css.')) {
			compat_keys[compat_feature] = id
		}
	}
}

function write(relative_path: string, contents: unknown) {
	const out = fileURLToPath(new URL(relative_path, import.meta.url))
	writeFileSync(out, JSON.stringify(contents, undefined, 2))
	return out
}

const features_path = write('../src/lib/data/css-features.generated.json', css_features)
const compat_keys_path = write('../src/lib/data/compat-keys.generated.json', compat_keys)

console.log(`Wrote ${Object.keys(css_features).length} CSS features to ${features_path}`)
console.log(`Wrote ${Object.keys(compat_keys).length} compat keys to ${compat_keys_path}`)
