import {
	angle_units,
	decibel_units,
	flex_units,
	frequency_units,
	length_units,
	resolution_units,
	semitone_units,
	time_units
} from '@projectwallace/css-analyzer/values'

export const all = [
	...length_units.set,
	...angle_units.set,
	...time_units.set,
	...frequency_units.set,
	...resolution_units.set,
	...flex_units.set,
	...decibel_units.set,
	...semitone_units.set
]
