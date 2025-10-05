import { expect, test } from 'vitest'
import { filter_coverage } from './calculate-coverage'

// oxlint-disable-next-line no-unused-vars
function mock_html_parser(html: string): Document {
	// @ts-expect-error we do not expect this function to be called during these tests
	return
}

test('skips .js files', () => {
	let input = [{ url: 'https://example.com/main.js', ranges: [], text: 'console.log(0);' }]
	expect(filter_coverage(input, mock_html_parser)).toHaveLength(0)
})

test('skips .js files w/o text', () => {
	let input = [{ url: 'https://example.com/main.js', ranges: [] }]
	expect(filter_coverage(input, mock_html_parser)).toHaveLength(0)
})

test('keeps .css files', () => {
	let input = [{ url: 'https://example.com/style.css', ranges: [], text: 'a {}' }]
	expect(filter_coverage(input, mock_html_parser)).toHaveLength(1)
})

test('skips .css files without text', () => {
	let input = [{ url: 'https://example.com/style.css', ranges: [] }]
	expect(filter_coverage(input, mock_html_parser)).toHaveLength(0)
})

test('does not skip .css files with empty ranges', () => {
	let input = [{ url: 'https://example.com/style.css', ranges: [], text: 'a {}' }]
	expect(filter_coverage(input, mock_html_parser)).toHaveLength(1)
})
