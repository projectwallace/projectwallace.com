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
	return `${format_number(ratio * 100, { decimals })}%`
}