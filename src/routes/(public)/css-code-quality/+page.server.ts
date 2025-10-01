import { getDocs } from "$lib/code-quality"

export function load() {
	return {
		docs: getDocs(),
	}
}
