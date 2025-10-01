'use strict'

const BYTE_UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

export function format_filesize(number: number) {
	if (number === 0) {
		return ' 0 ' + BYTE_UNITS[0]
	}

	const isNegative = number < 0
	const prefix = isNegative ? '-' : ''

	if (isNegative) {
		number = -number
	}

	if (number < 1) {
		const numberString = number.toLocaleString()
		return prefix + numberString + ' ' + BYTE_UNITS[0]
	}

	const exponent = Math.min(Math.floor(Math.log10(number) / 3), BYTE_UNITS.length - 1)
	// eslint-disable-next-line unicorn/prefer-exponentiation-operator
	number = Number((number / Math.pow(1000, exponent)).toPrecision(3))
	const numberString = number.toLocaleString()

	const unit = BYTE_UNITS[exponent]

	return prefix + numberString + ' ' + unit
}
