import { describe, test, expect } from 'vitest'
import { format_filesize } from './format-filesize'

describe('format_filesize', () => {
	test('zero', () => {
		expect(format_filesize(0)).toMatchInlineSnapshot(`"0B"`)
	})

	test('kilobytes', () => {
		expect(format_filesize(1000)).toMatchInlineSnapshot(`"1kB"`)
		expect(format_filesize(1500)).toMatchInlineSnapshot(`"1.5kB"`)
	})

	test('megabytes', () => {
		expect(format_filesize(1_000_000)).toMatchInlineSnapshot(`"1MB"`)
		expect(format_filesize(2_500_000)).toMatchInlineSnapshot(`"2.5MB"`)
	})

	test('negative values', () => {
		expect(format_filesize(-1000)).toMatchInlineSnapshot(`"-1kB"`)
		expect(format_filesize(-500)).toMatchInlineSnapshot(`"-500B"`)
	})
})
