import { get_docs } from './code-quality.js'

export function load() {
	return {
		docs: get_docs()
	}
}
