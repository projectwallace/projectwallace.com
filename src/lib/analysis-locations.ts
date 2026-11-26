import type { CountItem, CountResult, Location } from '@projectwallace/css-analyzer'
import type { CssLocation } from '#lib/css-location.ts'

export function to_css_location(location: Location): CssLocation {
	return {
		line: location.line,
		column: location.column,
		offset: location.start_offset,
		length: location.end_offset - location.start_offset
	}
}

/** Every unique item of a count result, mapped to where it occurs in the source */
export function with_locations(result: CountResult<CountItem>): Record<string, CssLocation[]> {
	let items: Record<string, CssLocation[]> = {}
	for (let [item, { locations }] of result.unique) {
		items[item] = locations?.map((location) => to_css_location(location)) ?? []
	}
	return items
}
