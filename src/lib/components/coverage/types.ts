export type Range = {
	start: number
	end: number
}

export type Coverage = {
	url: string
	text?: string
	ranges: Range[]
}
