// The only reason this is a .spec file and not a .test is because we need playwright installed
// import { test, expect, describe, beforeAll } from 'vitest'
import { chromium, test, expect } from '@playwright/test'
import { calculate_coverage } from './calculate-coverage'
import { DOMParser } from 'linkedom'
import type { Coverage } from './types'
import { format } from '@projectwallace/format-css'

function html_parser(html: string) {
	return new DOMParser().parseFromString(html, 'text/html')
}

async function collect_coverage(html: string, { link_css }: { link_css?: string } = {}) {
	let browser = await chromium.launch({ headless: true })
	let page = await browser.newPage()
	await page.route('**/test.html', (route) => {
		route.fulfill({
			status: 200,
			contentType: 'text/html',
			body: html
		})
	})
	await page.route('**/style.css', (route) => {
		route.fulfill({
			status: 200,
			contentType: 'text/css',
			body: link_css || ''
		})
	})
	await page.coverage.startCSSCoverage()
	await page.goto('http://localhost/test.html', { waitUntil: 'domcontentloaded' })
	await page.evaluate(() => getComputedStyle(document.body)) // force CSS evaluation
	let coverage = await page.coverage.stopCSSCoverage()
	await browser.close()
	return coverage
}

test.describe('collect coverage', () => {
	test('collects coverage from html <style> tag', async () => {
		let html = `
		<!doctype html>
		<html>
			<head>
				<title>test document</title>
				<style>
					body { margin: 0; }
					p { color: green } /* not covered */
					h1 { color: red; }
				</style>
			</head>
			<body>
				<h1>Hello world</h1>
			</body>
		</html>
		`
		let coverage = await collect_coverage(html)
		expect.soft(coverage).toHaveLength(1)
		expect.soft(coverage.at(0)).toEqual({
			url: 'http://localhost/test.html',
			text: '\n\t\t\t\t\tbody { margin: 0; }\n\t\t\t\t\tp { color: green } /* not covered */\n\t\t\t\t\th1 { color: red; }\n\t\t\t\t',
			ranges: [
				{ start: 6, end: 25 },
				{ start: 73, end: 91 }
			]
		})
	})

	test('collects coverage from <link rel="stylesheet">', async () => {
		let html = `
		<!doctype html>
		<html>
			<head>
				<title>test document</title>
				<link rel="stylesheet" href="http://localhost/style.css">
			</head>
			<body>
				<h1>Hello world</h1>
			</body>
		</html>
		`
		let css = `
			body { margin: 0; }
			p { color: green } /* not covered */
			h1 { color: red; }
		`
		let coverage = await collect_coverage(html, { link_css: css })
		expect.soft(coverage).toHaveLength(1)
		expect.soft(coverage.at(0)).toEqual({
			url: 'http://localhost/style.css',
			text: '\n\t\t\tbody { margin: 0; }\n\t\t\tp { color: green } /* not covered */\n\t\t\th1 { color: red; }\n\t\t',
			ranges: [
				{ start: 4, end: 23 },
				{ start: 67, end: 85 }
			]
		})
	})

	// test.todo('collects coverage from <style> and <link rel="stylesheet">')

	test.describe('coverage quirks', () => {
		test('coverage does not include the prelude and name of an atrule', async () => {
			let html = `
				<!doctype html>
				<html>
					<head>
						<title>test document</title>
						<link rel="stylesheet" href="http://localhost/style.css">
					</head>
					<body>
						<h1>Hello world</h1>
					</body>
				</html>
				`
			let css = `
				@media all {
					h1 {
						color: green;
					}
				}
				@supports (display: grid) {
					h1 {
						font-size: 24px;
					}
				}
			`
			let coverage = await collect_coverage(html, { link_css: css })
			expect.soft(coverage).toHaveLength(1)
			let sheet = coverage.at(0)!
			expect.soft(sheet?.ranges).toEqual([
				{ start: 12, end: 16 },
				{ start: 23, end: 54 },
				{ start: 75, end: 91 },
				{ start: 98, end: 132 }
			])
			// Browser coverage data always skips the `@` symbol with the atrule name
			// as well as the opening `{` and closing `}` of the atrule.
			expect.soft(sheet.text!.substring(12, 16)).toBe('all ')
			expect.soft(sheet.text!.substring(23, 54)).toBe('h1 {\n\t\t\t\t\t\tcolor: green;\n\t\t\t\t\t}')
			expect.soft(sheet.text!.substring(75, 91)).toBe('(display: grid) ')
			expect.soft(sheet.text!.substring(98, 132)).toBe('h1 {\n\t\t\t\t\t\tfont-size: 24px;\n\t\t\t\t\t}')
		})
	})
})

test.describe('calculates coverage', () => {
	test.describe('from <style> tag', async () => {
		let coverage: Coverage[]

		test.beforeAll(async () => {
			let html = `
			<!doctype html>
				<html>
					<head>
						<title>test document</title>
						<style>
							body { margin: 0; }
							p { color: green } /* not covered */
							h1 { color: red; }
						</style>
					</head>
					<body>
						<h1>Hello world</h1>
					</body>
				</html>
			`
			coverage = await collect_coverage(html)
		})

		test('counts totals', () => {
			let result = calculate_coverage(coverage, html_parser)
			expect.soft(result.files_found).toBe(1)
			expect.soft(result.total_bytes).toBe(80)
			expect.soft(result.used_bytes).toBe(37)
			expect.soft(result.unused_bytes).toBe(44)
			expect.soft(result.total_lines).toBe(11)
			expect.soft(result.covered_lines).toBe(7)
			expect.soft(result.uncovered_lines).toBe(11 - 7)
			expect.soft(result.line_coverage_ratio).toBe(7 / 11)
		})

		test('calculates stats per stylesheet', () => {
			let result = calculate_coverage(coverage, html_parser)
			let sheet = result.coverage_per_stylesheet.at(0)!
			expect.soft(sheet.url).toBe('http://localhost/test.html')
			expect.soft(sheet.ranges).toEqual([
				{ start: 0, end: 20 },
				{ start: 61, end: 80 }
			])
			expect.soft(sheet.total_lines).toBe(11)
			expect.soft(sheet.covered_lines).toBe(7)
			expect.soft(sheet.uncovered_lines).toBe(4)
			expect.soft(sheet.line_coverage_ratio).toBe(7 / 11)
			expect.soft(sheet.line_coverage).toEqual(new Uint8Array([1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1]))
		})
	})

	test.describe('from <link rel="stylesheet">', () => {
		let coverage: Coverage[]
		let css = `
			body { margin: 0; }
			p { color: green } /* not covered */
			h1 { color: red; }
			p { color: green } /* not covered */
			@media (width > 40em) {
				h1 { font-size: 24px; }
			}
		`

		test.beforeAll(async () => {
			let html = `
				<!doctype html>
				<html>
					<head>
						<title>test document</title>
						<link rel="stylesheet" href="http://localhost/style.css">
					</head>
					<body>
						<h1>Hello world</h1>
					</body>
				</html>
			`
			coverage = await collect_coverage(html, { link_css: css })
		})

		test('counts totals', () => {
			let result = calculate_coverage(coverage, html_parser)
			expect.soft(result.files_found).toBe(1)
			expect.soft(result.total_bytes).toBe(174)
			expect.soft(result.used_bytes).toBe(80)
			expect.soft(result.unused_bytes).toBe(95)
			expect.soft(result.total_lines).toBe(21)
			expect.soft(result.covered_lines).toBe(12)
			expect.soft(result.uncovered_lines).toBe(21 - 12)
			expect.soft(result.line_coverage_ratio).toBe(12 / 21)
		})

		test('calculates stats per stylesheet', () => {
			let result = calculate_coverage(coverage, html_parser)
			let sheet = result.coverage_per_stylesheet.at(0)!
			expect.soft(sheet.url).toBe('http://localhost/style.css')
			expect.soft(sheet.ranges).toEqual([
				{ start: 0, end: 20 },
				{ start: 61, end: 80 },
				{ start: 128, end: 142 },
				{ start: 146, end: 172 }
			])
			expect.soft(sheet.total_lines).toBe(21)
			expect.soft(sheet.covered_lines).toBe(12)
			expect.soft(sheet.uncovered_lines).toBe(21 - 12)
			expect.soft(sheet.line_coverage_ratio).toBe(12 / 21)
			expect
				.soft(sheet.line_coverage)
				.toEqual(new Uint8Array([1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1]))
			expect.soft(sheet.text).toEqual(format(css))
		})
	})

	test.describe('from coverage data downloaded directly from the browser as JSON', () => {
		// This coverage was taken from Edge devtools
		let coverage = [
			{
				url: 'https://example.com',
				ranges: [
					{
						start: 230,
						end: 271
					},
					{
						start: 323,
						end: 338
					},
					{
						start: 342,
						end: 367
					},
					{
						start: 389,
						end: 423
					}
				],
				text: '<!DOCTYPE html>\n<html lang="en" >\n\n<head>\n  <meta charset="UTF-8">\n  \n  \n  \n\n  <title>Untitled</title>\n\n    <link rel="canonical" href="https://codepen.io/bartveneman/pen/QwydYVy">\n  \n  \n  \n  \n\n  \n  \n  \n</head>\n\n<body>\n  <style>\n\th1 {\n\t\tcolor: blue;\n\t\tfont-size: 24px;\n\t}\n\n\t/* not covered */\n\tp {\n\t\tcolor: red;\n\t}\n\n\t@media (width > 30em) {\n\t\th1 {\n\t\t\tcolor: green;\n\t\t}\n\t}\n</style>\n\n<script>\n\tconsole.log(`I\'m 100% covered`)\n</script>\n\n<h1>Hello world</h1>\n  \n  \n  \n</body>\n\n</html>\n'
			}
		]

		test('counts totals', () => {
			let result = calculate_coverage(coverage, html_parser)
			expect.soft(result.covered_lines).toBe(9)
			expect.soft(result.uncovered_lines).toBe(5)
			expect.soft(result.total_lines).toBe(14)
			expect.soft(result.line_coverage_ratio).toBe(9 / 14)
		})

		test('extracts and formats css', () => {
			let result = calculate_coverage(coverage, html_parser)
			expect(result.coverage_per_stylesheet.at(0)?.text).toEqual(
				format(`h1 {
					color: blue;
					font-size: 24px;
				}

				/* not covered */
				p {
					color: red;
				}

				@media (width > 30em) {
					h1 {
						color: green;
					}
				}`)
			)
		})

		test('calculates line coverage', () => {
			let result = calculate_coverage(coverage, html_parser)
			expect(result.coverage_per_stylesheet.at(0)?.line_coverage).toEqual(
				new Uint8Array([
					// h1 {}
					1, 1, 1, 1,
					// comment + p {}
					0, 0, 0, 0,
					// @media
					1,
					// h1 {
					1, 0,
					// color: green; }
					1, 1, 1
				])
			)
		})
	})
})
