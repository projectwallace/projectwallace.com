import { getDocs } from '$lib/code-quality'

export const prerender = true

export function load() {
	return {
		docs: getDocs()
	}
}
