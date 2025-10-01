import { convert } from 'css-time-sort'

export function validate(time: string) {
	let normalized = convert(time)
	if (normalized < 0) return false
	if (normalized === Number.MAX_SAFE_INTEGER) return false
	return true
}
