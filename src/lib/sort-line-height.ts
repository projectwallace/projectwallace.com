export const MAX = Number.MAX_SAFE_INTEGER

const BASE_FONT_SIZE = 16

export function normalize_line_height(value: string): number {
	if (/^normal$/i.test(value)) {
		return 1.5 * BASE_FONT_SIZE
	}

	let parsed = parseFloat(value)
	if (Number.isNaN(parsed)) {
		return MAX
	}

	// percentage
	if (value.endsWith('%')) {
		return (parsed / 100) * BASE_FONT_SIZE
	}

	// em or rem unit
	if (/\dr?em$/i.test(value)) {
		return parsed * BASE_FONT_SIZE
	}

	// px unit
	if (/\dpx$/i.test(value)) {
		return parsed
	}

	// unitless number (e.g., 1.5, 2, 0, -0, 2e3)
	if (/^[-+]?\d*\.?\d+(e[+-]?\d+)?$/.test(value)) {
		return parsed * BASE_FONT_SIZE
	}

	return MAX
}