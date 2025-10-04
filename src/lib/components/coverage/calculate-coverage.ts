import type { Coverage, Range } from './types'
import { prettify } from './prettify'

export function ext(url: string) {
	try {
		let parsed_url = new URL(url)
		return parsed_url.pathname.slice(parsed_url.pathname.lastIndexOf('.') + 1)
	} catch {
		let ext_index = url.lastIndexOf('.')
		return url.slice(ext_index, url.indexOf('/', ext_index) + 1)
	}
}

interface HtmlParser {
	(html: string): Document;
}

function get_css_and_ranges_from_html(parse_html: HtmlParser, html: string, old_ranges: Range[]) {
	let doc = parse_html(html)
	let combined_css = ''
	let new_ranges = []
	let current_offset = 0
	let style_elements = doc.querySelectorAll('style')

	for (let style_element of style_elements) {
		let style_content = style_element.textContent
		if (!style_content) continue

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
					end: current_offset + (range.end - start_index),
				})
			}
		}

		// Update the current offset for the next style tag
		current_offset += style_content.length
	}

	return {
		css: combined_css,
		ranges: new_ranges
	};
}

export function calculate_coverage(browser_coverage: Coverage[], parse_html: HtmlParser) {
	let total_bytes = 0
	let used_bytes = 0
	let unused_bytes = 0
	let files_found = browser_coverage.length
	let filtered_coverage = []

	for (let entry of browser_coverage) {
		if (!entry.text) continue
		let extension = ext(entry.url).toLowerCase()
		if (extension === 'js') continue

		// Always include CSS files
		if (extension === 'css') {
			filtered_coverage.push(entry)
			continue
		}

		// At this point it's almost certainly an inline HTML style tag
		// TODO
		// But!!! in case of running Playwright on localhost we still end
		// up here because all CSS is reported as { url: 'http://localhost/my-page', text: '.my-css {}' }
		// which is not HTML but pure CSS
		let { css, ranges } = get_css_and_ranges_from_html(parse_html, entry.text, entry.ranges)
		filtered_coverage.push({
			url: entry.url,
			text: css,
			ranges,
		})
	}

	let prettified_coverage = prettify(filtered_coverage)

	// prerequisites
	// - we check each stylesheet content only once (to avoid counting the same content multiple times)
	// - if a duplicate stylesheet enters the room, we add it's ranges to the existing stylesheet's ranges
	// - only bytes of deduplicated stylesheets are counted
	// - after all entries have been processed, we calculate the total bytes, used bytes, and unused bytes

	let checked_stylesheets = new Map<string, { url: string, ranges: Range[] }>()

	for (let entry of prettified_coverage) {
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
			total_bytes += text.length
			checked_stylesheets.set(text, {
				url: entry.url,
				ranges: entry.ranges,
			})
		}
	}

	// We sort the ranges by their start position
	// Then we iterate over the ranges and calculate the used bytes
	// Unused pieces of the stylesheet are stored in the unused_parts array
	for (let [text, { ranges }] of checked_stylesheets) {
		let last_position = 0
		ranges.sort((a, b) => a.start - b.start)
		for (let range of ranges) {
			if (range.start > last_position) {
				let unused_text = text.slice(last_position, range.start)
				unused_bytes += unused_text.trim().length
			}
			used_bytes += range.end - range.start - 1
			last_position = range.end
		}
	}

	let coverage_per_stylesheet = Array.from(checked_stylesheets).map(([text, { url, ranges }]) => {
		let used = ranges.reduce((acc, range) => acc + (range.end - range.start), 0)
		let trimmed_text = text.trim()

		let lines = trimmed_text.split('\n')
		let line_coverage = new Uint8Array(lines.length)
		let lines_covered = 0
		let offset = 0
		let index = 0
		for (let line of lines) {
			let start = offset
			let end = offset + line.length
			let next_offset = end + 1 // +1 for the newline character
			let is_in_range = false

			for (let range of ranges) {
				if (range.start <= start && range.end >= end) {
					is_in_range = true
					break
				} else if (line.startsWith('@') && range.start > start && range.start < next_offset) {
					is_in_range = true
					break
				}
			}

			let trimmed_line = line.trim()
			let is_empty = trimmed_line.length === 0
			let is_closing_brace = trimmed_line === '}'
			let prev_is_covered = index > 0 ? line_coverage[index - 1] === 1 : false

			if (is_in_range && !is_closing_brace && !is_empty) {
				lines_covered++
				line_coverage[index] = 1
			}
			else if ((is_empty || is_closing_brace) && prev_is_covered) {
				lines_covered++
				line_coverage[index] = 1
			}
			else if (is_empty && line_coverage[index - 1] === 0) {
				line_coverage[index] = 0
			}
			else {
				line_coverage[index] = 0
			}
			offset = next_offset
			index++
		}

		return {
			url,
			text: trimmed_text,
			ranges,
			used_bytes: used,
			total_bytes: trimmed_text.length,
			coverage_ratio: lines_covered / line_coverage.length,
			line_coverage,
			total_lines: line_coverage.length,
			covered_lines: lines_covered,
			uncovered_lines: line_coverage.length - lines_covered,
		}
	})

	let coverage_ratio = coverage_per_stylesheet.reduce((acc, sheet) => acc + sheet.coverage_ratio, 0) / coverage_per_stylesheet.length

	return {
		files_found,
		total_bytes,
		used_bytes,
		unused_bytes,
		coverage_ratio,
		coverage_per_stylesheet,
	}
}