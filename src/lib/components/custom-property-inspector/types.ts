import type { CssLocation } from '$lib/css-location'

type Node = {
	title: string
	name: string
	type: 'property' | 'location'
}

export type Location = Node & {
	type: 'location'
	index: number
	parent: string
	count: never
	location: CssLocation
	level: never
	children: never
}

export const USED = 0 as const
export const UNUSED = 1 as const
export const UNDECLARED = 2 as const
export const UNDECLARED_WITH_FALLBACK = 3 as const

export type TreeItem = Node & {
	count: number
	type: 'property'
	index: never
	parent: never
	location?: CssLocation // only to satisfy ts:check, not actually used
	children?: Location[]
	level: typeof USED | typeof UNUSED | typeof UNDECLARED | typeof UNDECLARED_WITH_FALLBACK
	search_query: string
}
