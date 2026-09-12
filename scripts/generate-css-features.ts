import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import data from 'web-features/data.json' with { type: 'json' }
import type { Baseline, CssFeature } from '../src/lib/baseline/css-feature.js'
import { browsers, type BrowserId } from '../src/lib/baseline/browsers.ts'

type WebFeaturesData = {
	features: typeof import('web-features').features
}

const { features } = data as WebFeaturesData

const css_features: Record<string, CssFeature> = {}
const compat_keys: Record<string, string> = {}

for (const [id, feature] of Object.entries(features)) {
	if (feature.kind !== 'feature' || !feature.group) {
		continue
	}

	// A feature's `group` (e.g. "view-transitions", "scrolling") doesn't
	// reliably nest under a "css" root in web-features' taxonomy, so group
	// membership can't tell CSS features apart from JS/HTML/SVG ones. Its
	// `compat_features` can though: any feature with at least one `css.*`
	// key genuinely has CSS surface worth tracking.
	let css_compat_keys = (feature.compat_features ?? []).filter((key) => key.startsWith('css.'))
	if (css_compat_keys.length === 0) {
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
		// web-features tracks far more browsers than we display, so this is
		// filtered down to the ones in browsers.ts.
		support:
			baseline === false
				? (Object.keys(feature.status.support ?? {}).filter((id) => id in browsers) as BrowserId[])
				: undefined,
		caniuse: feature.caniuse?.[0]
	}

	for (const compat_feature of css_compat_keys) {
		compat_keys[compat_feature] = id
	}
}

function write(relative_path: string, contents: unknown) {
	const out = fileURLToPath(new URL(relative_path, import.meta.url))
	writeFileSync(out, JSON.stringify(contents, undefined, 2))
	return out
}

const features_path = write('../src/lib/baseline/css-features.generated.json', css_features)
const compat_keys_path = write('../src/lib/baseline/compat-keys.generated.json', compat_keys)

console.log(`Wrote ${Object.keys(css_features).length} CSS features to ${features_path}`)
console.log(`Wrote ${Object.keys(compat_keys).length} compat keys to ${compat_keys_path}`)
