import { string_sort } from "./string-sort"

export function normalize(selector: string) {
	// 10%, 20.5%, etc.
	if (selector.charCodeAt(selector.length - 1) === 37) { // 37 == '%'
		return Number(selector.substring(0, selector.length - 1))
	}

	let value = selector.toLowerCase()
	if (value === 'from') return 0
	if (value === 'to') return 100
	// Unknown value
	return Infinity
}

export function sort(a: string, b: string) {
	let A = normalize(a)
	let B = normalize(b)

	if (A === B) {
		if (a.toLowerCase() === 'from') return -1
		if (a.toLowerCase() === 'to') return 1
		return string_sort(b, a)
	}

	return A - B
}