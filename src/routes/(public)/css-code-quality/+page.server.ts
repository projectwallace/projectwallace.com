import { get_docs } from './code-quality.ts'

export function load() {
	return {
		docs: get_docs()
	}
}
