import { test, expect, describe, beforeAll } from 'vitest'
import { chromium } from '@playwright/test'
import { calculate_coverage } from './calculate-coverage'
import { DOMParser } from 'linkedom'
import type { Coverage } from './types'

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

describe('collect coverage', () => {
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
	test.todo('collects coverage from <style> and <link rel="stylesheet">')
})

describe('calculates coverage', () => {
	// TODO: add support for <style> tag extraction
	test.skip('from <style> tag', async () => {
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
		let result = calculate_coverage(coverage, html_parser)
	})

	describe('from <link rel="stylesheet">', () => {
		let coverage: Coverage[]
		beforeAll(async () => {
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
			coverage = await collect_coverage(html, { link_css: css })
		})

		test('counts totals', () => {
			let result = calculate_coverage(coverage, html_parser)
			expect.soft(result.files_found).toBe(1)
			expect.soft(result.total_bytes).toBe(80)
			expect.soft(result.used_bytes).toBe(37)
			expect.soft(result.unused_bytes).toBe(41)
			expect.soft(result.total_lines).toBe(11)
			expect.soft(result.covered_lines).toBe(7)
			expect.soft(result.uncovered_lines).toBe(4)
			expect.soft(result.line_coverage).toBe(7 / 11)
		})

		test('calculates stats per stylesheet', () => {
			let result = calculate_coverage(coverage, html_parser)
			let sheet = result.coverage_per_stylesheet.at(0)!
			expect.soft(sheet.url).toBe('http://localhost/style.css')
			expect.soft(sheet.ranges).toEqual([
				{ start: 0, end: 20 },
				{ start: 61, end: 80 }
			])
			expect.soft(sheet.total_lines).toBe(11)
			expect.soft(sheet.covered_lines).toBe(7)
			expect.soft(sheet.uncovered_lines).toBe(4)
			expect.soft(sheet.line_coverage).toEqual(new Uint8Array([1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1]))
		})
	})
})
