import {
	angle_units,
	flex_units,
	length_units,
	resolution_units,
	time_units
} from '@projectwallace/css-analyzer/values'

// Not exported by the analyzer
const viewport_min_max = ['svmin', 'lvmin', 'dvmin', 'svmax', 'lvmax', 'dvmax'] // https://drafts.csswg.org/css-values-4/#viewport-relative-lengths
const frequency = ['hz', 'khz'] // https://www.w3.org/TR/css-values-3/#frequency
const decibel = ['db'] // https://www.w3.org/TR/css3-speech/#mixing-props-voice-volume
const semitones = ['st'] // https://www.w3.org/TR/css3-speech/#voice-props-voice-pitch

export const all = [
	...length_units.set,
	...viewport_min_max,
	...angle_units.set,
	...time_units.set,
	...frequency,
	...resolution_units.set,
	...flex_units.set,
	...decibel,
	...semitones
]
