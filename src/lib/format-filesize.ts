const byte_units = ['byte', 'kilobyte', 'megabyte'] as const

// Create one formatter for each of byte, kilobyte, megabyte
const formatters = byte_units.map(
	(unit, exponent) =>
		new Intl.NumberFormat('en-US', {
			style: 'unit',
			unit,
			// 'short' renders bytes as "116 byte"; 'long' pluralizes ("116 bytes")
			unitDisplay: exponent === 0 ? 'long' : 'short',
			maximumSignificantDigits: 3
		})
)

export function format_filesize(bytes: number): string {
	let value = bytes
	let unit_index = 0

	while (Math.abs(value) >= 1000 && unit_index < formatters.length - 1) {
		value /= 1000
		unit_index++
	}

	return formatters[unit_index].format(value)
}
