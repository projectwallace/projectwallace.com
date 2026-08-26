export type Baseline = false | 'low' | 'high'

export type CssFeature = {
	name: string
	baseline: Baseline
	baseline_low_date?: string
	baseline_high_date?: string
	/**
	 * Browser ids (see `#lib/data/browsers.js`) that have added support, for
	 * features with limited availability. Only present when `baseline` is
	 * `false` - tracked/newly/widely-available features don't need it.
	 */
	support?: string[]
}
