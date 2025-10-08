import type { Coverage, Range } from './types.ts'
import { prettify } from './prettify.ts'
import { ext } from './ext.ts'
import type { HTMLDocument } from 'linkedom/types/html/document'

interface HtmlParser {
	(html: string): Document | HTMLDocument
}

export function get_css_and_ranges_from_html(parse_html: HtmlParser, html: string, old_ranges: Range[]) {
	let doc = parse_html(html)
	let combined_css = ''
	let new_ranges = []
	let current_offset = 0
	let style_elements = doc.querySelectorAll('style')

	for (let style_element of style_elements) {
		let style_content = style_element.textContent
		if (!style_content.trim()) continue

		// Append the style content directly to the combined CSS
		combined_css += style_content

		// Find the offsets of this style element's content in the original HTML
		let start_index = html.indexOf(style_content)
		let end_index = start_index + style_content.length

		// Iterate through ranges and adjust if they fall within the current style tag
		for (let range of old_ranges) {
			if (range.start >= start_index && range.end <= end_index) {
				new_ranges.push({
					start: current_offset + (range.start - start_index),
					end: current_offset + (range.end - start_index)
				})
			}
		}

		// Update the current offset for the next style tag
		current_offset += style_content.length
	}

	return {
		css: combined_css,
		ranges: new_ranges
	}
}

function is_html(text: string): boolean {
	return /<\/?(html|body|head|div|span|script|style)/i.test(text)
}

export function filter_coverage(coverage: Coverage[], parse_html: HtmlParser): Coverage[] {
	let result = []

	for (let entry of coverage) {
		if (!entry.text) continue
		let extension = ext(entry.url).toLowerCase()
		if (extension === 'js') continue

		// Always include CSS files
		if (extension === 'css') {
			result.push(entry)
			continue
		}

		if (is_html(entry.text)) {
			let { css, ranges } = get_css_and_ranges_from_html(parse_html, entry.text, entry.ranges)
			result.push({
				url: entry.url,
				text: css,
				ranges
			})
			continue
		}

		// At this point it can only be CSS
		result.push({
			url: entry.url,
			text: entry.text,
			ranges: entry.ranges
		})
	}

	return result
}

/**
 * @description
 * prerequisites
 * - we check each stylesheet content only once (to avoid counting the same content multiple times)
 * - if a duplicate stylesheet enters the room, we add it's ranges to the existing stylesheet's ranges
 * - only bytes of deduplicated stylesheets are counted
 * - after all entries have been processed, we calculate the total bytes, used bytes, and unused bytes
 */
export function deduplicate_entries(
	entries: Coverage[]
): Map<NonNullable<Coverage['text']>, Pick<Coverage, 'ranges' | 'url'>> {
	let checked_stylesheets = new Map<string, { url: string; ranges: Range[] }>()

	for (let entry of entries) {
		let text = entry.text || ''
		if (checked_stylesheets.has(text)) {
			let sheet = checked_stylesheets.get(text)!
			let ranges = sheet.ranges
			// Check if the ranges are already in the checked_stylesheets map
			// If not, add them
			for (let range of entry.ranges) {
				let found = false
				for (let checked_range of ranges) {
					if (checked_range.start === range.start && checked_range.end === range.end) {
						found = true
						break
					}
				}
				if (!found) {
					ranges.push(range)
				}
			}
		} else {
			checked_stylesheets.set(text, {
				url: entry.url,
				ranges: entry.ranges
			})
		}
	}

	return checked_stylesheets
}

type CoverageData = {
	unused_bytes: number
	used_bytes: number
	total_bytes: number
	line_coverage_ratio: number
	byte_coverage_ratio: number
	total_lines: number
	covered_lines: number
	uncovered_lines: number
}

export type StylesheetCoverage = CoverageData & {
	url: string
	text: string
	ranges: Range[]
	line_coverage: Uint8Array
}

export type CoverageResult = CoverageData & {
	files_found: number
	coverage_per_stylesheet: StylesheetCoverage[]
}

/**
 * @description
 * CSS Code Coverage calculation
 *
 * These are the steps performed to calculate coverage:
 * 1. Filter eligible files
 * 2. Prettify the CSS dicovered in each Coverage and update their ranges
 * 3. De-duplicate Coverages: merge all ranges for CSS sources occurring multiple times
 * 4. Calculate used/unused CSS bytes (fastest path, no inspection of the actual CSS needed)
 * 5. Calculate line-coverage, byte-coverage per stylesheet
 */
export function calculate_coverage(coverage: Coverage[], parse_html: HtmlParser): CoverageResult {
	let files_found = coverage.length
	let filtered_coverage = filter_coverage(coverage, parse_html)
	let prettified_coverage = prettify(filtered_coverage)
	let deduplicated = deduplicate_entries(prettified_coverage)

	// SECTION: calculate coverage for each individual stylesheet we found
	let coverage_per_stylesheet = Array.from(deduplicated).map(([text, { url, ranges }]) => {
		let lines = text.split('\n')
		let total_file_lines = lines.length
		let line_coverage = new Uint8Array(total_file_lines)
		let file_lines_covered = 0
		let file_total_bytes = 0
		let file_bytes_covered = 0
		let file_bytes_uncovered = 0
		let offset = 0
		let index = 0

		function is_line_covered(line: string, start_offset: number) {
			let end = start_offset + line.length
			let next_offset = end + 1 // account for newline character
			let is_empty = /^\s*$/.test(line)
			let is_closing_brace = line.endsWith('}')

			if (!is_empty && !is_closing_brace) {
				for (let range of ranges) {
					if (range.start <= start_offset && range.end >= end) {
						return true
					} else if (line.startsWith('@') && range.start > start_offset && range.start < next_offset) {
						return true
					}
				}
			}
			return false
		}

		for (let line of lines) {
			let start = offset
			let end = offset + line.length
			let next_offset = end + 1 // +1 for the newline character
			let is_empty = /^\s*$/.test(line)
			let is_closing_brace = line.endsWith('}')
			let is_in_range = is_line_covered(line, start)
			file_total_bytes += line.length + 1

			if (is_in_range) {
				file_bytes_covered += line.length + 1
			} else {
				file_bytes_uncovered += line.length + 1
			}

			let prev_is_covered = index > 0 ? line_coverage[index - 1] === 1 : false

			if (is_in_range && !is_closing_brace && !is_empty) {
				file_lines_covered++
				line_coverage[index] = 1
			} else if ((is_empty || is_closing_brace) && prev_is_covered) {
				file_lines_covered++
				line_coverage[index] = 1
			} else if (is_empty && !prev_is_covered) {
				// If the next line is covered, mark this empty line as covered
				// and vice versa
				if (is_line_covered(lines[index + 1], next_offset)) {
					line_coverage[index] = 1
					file_lines_covered++
				} else {
					line_coverage[index] = 0
				}
			} else {
				line_coverage[index] = 0
			}
			offset = next_offset
			index++
		}

		return {
			url,
			text,
			ranges,
			unused_bytes: file_bytes_uncovered,
			used_bytes: file_bytes_covered,
			total_bytes: file_total_bytes,
			line_coverage_ratio: file_lines_covered / total_file_lines,
			byte_coverage_ratio: file_bytes_covered / file_total_bytes,
			line_coverage,
			total_lines: total_file_lines,
			covered_lines: file_lines_covered,
			uncovered_lines: total_file_lines - file_lines_covered
		}
	})

	let { total_lines, total_covered_lines, total_uncovered_lines, total_bytes, total_used_bytes, total_unused_bytes } =
		coverage_per_stylesheet.reduce(
			(totals, sheet) => {
				totals.total_lines += sheet.total_lines
				totals.total_covered_lines += sheet.covered_lines
				totals.total_uncovered_lines += sheet.uncovered_lines
				totals.total_bytes += sheet.total_bytes
				totals.total_used_bytes += sheet.used_bytes
				totals.total_unused_bytes += sheet.unused_bytes
				return totals
			},
			{
				total_lines: 0,
				total_covered_lines: 0,
				total_uncovered_lines: 0,
				total_bytes: 0,
				total_used_bytes: 0,
				total_unused_bytes: 0
			}
		)

	return {
		files_found,
		total_bytes,
		total_lines,
		used_bytes: total_used_bytes,
		covered_lines: total_covered_lines,
		unused_bytes: total_unused_bytes,
		uncovered_lines: total_uncovered_lines,
		byte_coverage_ratio: total_used_bytes / total_bytes,
		line_coverage_ratio: total_covered_lines / total_lines,
		coverage_per_stylesheet
	}
}
