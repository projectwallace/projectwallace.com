const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true })

export function string_sort(a: string, b: string): number {
	return collator.compare(a, b)
}
