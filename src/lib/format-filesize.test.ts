import { describe, test, expect } from 'vitest'
import { format_filesize } from './format-filesize'

describe('format_filesize', () => {
	test('zero', () => {
		expect(format_filesize(0)).toMatchInlineSnapshot(`"0 byte"`)
	})

	test('bytes', () => {
		expect(format_filesize(500)).toMatchInlineSnapshot(`"500 byte"`)
	})

	test('kilobytes', () => {
		expect(format_filesize(1000)).toMatchInlineSnapshot(`"1 kB"`)
		expect(format_filesize(1500)).toMatchInlineSnapshot(`"1.5 kB"`)
	})

	test('megabytes', () => {
		expect(format_filesize(1_000_000)).toMatchInlineSnapshot(`"1 MB"`)
		expect(format_filesize(2_500_000)).toMatchInlineSnapshot(`"2.5 MB"`)
	})

	test('negative values', () => {
		expect(format_filesize(-1000)).toMatchInlineSnapshot(`"-1 kB"`)
		expect(format_filesize(-500)).toMatchInlineSnapshot(`"-500 byte"`)
	})

	test('maximumSignificantDigits caps at 3', () => {
		expect(format_filesize(1_234_567)).toMatchInlineSnapshot(`"1.23 MB"`)
		expect(format_filesize(12_345)).toMatchInlineSnapshot(`"12.3 kB"`)
	})
})
