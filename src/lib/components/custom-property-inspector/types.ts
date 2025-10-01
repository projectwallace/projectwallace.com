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

export type TreeItem = Node & {
	count: number
	type: 'property'
	index: never
	parent: never
	location?: CssLocation // only to satisfy ts:check, not actually used
	children?: Location[]
	level: 0 | 1 | 2 | 3
	search_query: string
}