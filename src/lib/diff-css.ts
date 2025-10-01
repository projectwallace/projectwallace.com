import { structuredPatch } from 'diff'
import { format } from '@projectwallace/format-css'

export type StructuredPatch = {
	hunks: Hunk[]
	lines_added: number
	lines_removed: number
}

type Line = {
	value: string
	added: boolean
	deleted: boolean
	old_line_number: number
	new_line_number: number
}

export type Hunk = {
	oldStart: number
	oldLines: number
	newStart: number
	newLines: number
	lines: Line[]
}

export function diff_css(old_css: string, new_css: string): StructuredPatch {
	old_css = format(old_css)
	new_css = format(new_css)

	let patch = structuredPatch(`CSS@old`, `CSS@new`, old_css, new_css)

	if (!patch) {
		return {
			hunks: [],
			lines_added: 0,
			lines_removed: 0,
		}
	}

	let lines_added = 0
	let lines_removed = 0

	let hunks = patch.hunks.map((hunk) => {
		let old_line_number = hunk.oldStart
		let new_line_number = hunk.newStart
		let lines: Line[] = []

		for (let line of hunk.lines) {
			if (line === '\\ No newline at end of file') continue

			let added = line.charCodeAt(0) === 43 // +
			let deleted = line.charCodeAt(0) === 45 // -

			if (!added && !deleted) {
				old_line_number++
				new_line_number++
			} else if (added) {
				new_line_number++
				lines_added++
			} else if (deleted) {
				old_line_number++
				lines_removed++
			}

			lines.push({
				value: line.substring(1),
				added,
				deleted,
				old_line_number,
				new_line_number
			})
		}

		return {
			...hunk,
			lines
		}
	}) as Hunk[]

	return {
		hunks,
		lines_added,
		lines_removed,
	} as StructuredPatch
}