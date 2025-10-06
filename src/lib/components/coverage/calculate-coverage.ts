import type { Coverage, Range } from './types'
import { prettify } from './prettify'
import { ext } from './ext'
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

// TODO: add flag for prettification on/off
// When disabled we can skip the prettify step as well as recalculating the ranges in HTML (get_css_and_ranges_from_html)
// This also means that when pretty=true, parse_html MUST also be included. parse_html is optional when pretty=false
export function calculate_coverage(browser_coverage: Coverage[], parse_html: HtmlParser) {
	let total_bytes = 0
	let used_bytes = 0
	let unused_bytes = 0
	let total_lines = 0
	let covered_lines = 0
	let uncovered_lines = 0
	let files_found = browser_coverage.length
	let filtered_coverage = filter_coverage(browser_coverage, parse_html)
	let prettified_coverage = prettify(filtered_coverage)
	let deduplicated = deduplicate_entries(prettified_coverage)

	// SECTION: calculate used vs. unused bytes
	// We sort the ranges by their start position
	// Then we iterate over the ranges and calculate the used bytes
	for (let [text, { ranges }] of deduplicated) {
		total_bytes += text.length
		let last_position = 0
		ranges.sort((a, b) => a.start - b.start)
		for (let range of ranges) {
			if (range.start > last_position) {
				let unused_text = text.slice(last_position, range.start)
				unused_bytes += unused_text.length
			}
			used_bytes += range.end - range.start - 1
			last_position = range.end
		}
	}

	// SECTION: calculate coverage for each individual stylesheet we found
	let coverage_per_stylesheet = Array.from(deduplicated).map(([text, { url, ranges }]) => {
		let file_used_bytes = ranges.reduce((acc, range) => acc + (range.end - range.start), 0)
		let trimmed_text = text.trim()

		let lines = trimmed_text.split('\n')
		let total_file_lines = lines.length
		let line_coverage = new Uint8Array(total_file_lines)
		let file_lines_covered = 0
		let offset = 0
		let index = 0
		for (let line of lines) {
			let start = offset
			let end = offset + line.length
			let next_offset = end + 1 // +1 for the newline character
			let is_in_range = false
			let trimmed_line = line.trim()
			let is_empty = trimmed_line.length === 0
			let is_closing_brace = !is_empty && trimmed_line === '}'

			if (!is_empty && !is_closing_brace) {
				for (let range of ranges) {
					if (range.start <= start && range.end >= end) {
						is_in_range = true
						break
					} else if (trimmed_line.startsWith('@') && range.start > start && range.start < next_offset) {
						is_in_range = true
						break
					}
				}
			}

			let prev_is_covered = index > 0 ? line_coverage[index - 1] === 1 : false

			if (is_in_range && !is_closing_brace && !is_empty) {
				file_lines_covered++
				line_coverage[index] = 1
			} else if ((is_empty || is_closing_brace) && prev_is_covered) {
				file_lines_covered++
				line_coverage[index] = 1
			} else if (is_empty && line_coverage[index - 1] === 0) {
				line_coverage[index] = 0
			} else {
				line_coverage[index] = 0
			}
			offset = next_offset
			index++
		}

		total_lines += total_file_lines
		covered_lines += file_lines_covered
		uncovered_lines += total_file_lines - file_lines_covered

		return {
			url,
			text: trimmed_text,
			ranges,
			used_bytes: file_used_bytes,
			total_bytes: trimmed_text.length,
			coverage_ratio: file_lines_covered / total_file_lines,
			line_coverage,
			total_lines: total_file_lines,
			covered_lines: file_lines_covered,
			uncovered_lines: total_file_lines - file_lines_covered
		}
	})

	let coverage_ratio =
		coverage_per_stylesheet.reduce((acc, sheet) => acc + sheet.coverage_ratio, 0) / coverage_per_stylesheet.length

	return {
		files_found,
		total_bytes,
		total_lines,
		used_bytes,
		covered_lines,
		unused_bytes,
		uncovered_lines,
		coverage_ratio,
		line_coverage: covered_lines / total_lines,
		coverage_per_stylesheet
	}
}
