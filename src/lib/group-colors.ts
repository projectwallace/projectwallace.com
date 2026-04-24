import type { CssAnalysis } from "./analyze-css"
import { convert, color_group } from 'color-sorter'

export function group_colors(colors: CssAnalysis['values']['colors']['uniqueWithLocations']) {
	const converted = Object.keys(colors).map(convert)
	const grouped = Object.groupBy(converted, color_group)

	return Object.entries(grouped)
		.map(([group, items]) => [group, items!.sort((a, b) => a.lightness - b.lightness)] as const)
		.sort((a, b) => b[1].length - a[1].length)
}