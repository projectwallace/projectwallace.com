import type { CssLocation } from '#lib/css-location.ts'
import { string_sort } from '#lib/string-sort.ts'

export type UniqueEntry = [string, CssLocation[]]

export type SortOption = {
	label: string
	id: string
	fn: (a: UniqueEntry, b: UniqueEntry) => number
}

export const alphabetical_sorting: SortOption = {
	label: 'Sort A-Z',
	fn: (a, b) => string_sort(a[0], b[0]),
	id: 'alphabetical'
}
