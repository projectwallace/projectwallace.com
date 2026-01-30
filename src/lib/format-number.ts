export function format_number(number: number | string, { decimals = 3 } = {}) {
	if (Number.isNaN(number)) {
		return '0'
	}

	if (Number.isInteger(number)) {
		return number.toLocaleString()
	}

	return Number(number).toFixed(decimals)
}

export function format_percentage(ratio: number, { decimals = 2 } = {}): string {
	const value = Math.round(ratio * 100 * Math.pow(10, decimals)) / Math.pow(10, decimals)
	return `${format_number(value, { decimals })}%`
}