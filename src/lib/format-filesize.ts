const BYTE_UNITS = [
	'byte',
	'kilobyte',
	'megabyte',
	'gigabyte',
	'terabyte',
	'petabyte',
	'exabyte',
	'zettabyte',
	'yottabyte',
] as const

export function format_filesize(bytes: number): string {
	const isNegative = bytes < 0
	const abs = Math.abs(bytes)

	const exponent =
		abs < 1 ? 0 : Math.min(Math.floor(Math.log10(abs) / 3), BYTE_UNITS.length - 1)

	const value = abs === 0 ? 0 : abs / Math.pow(1000, exponent)

	const formatted = new Intl.NumberFormat(undefined, {
		style: 'unit',
		unit: BYTE_UNITS[exponent],
		unitDisplay: 'narrow',
		maximumSignificantDigits: 3,
	}).format(value)

	return isNegative ? `-${formatted}` : formatted
}
