import { getDocs } from '#lib/code-quality.js'

export function load() {
	return {
		docs: getDocs()
	}
}
