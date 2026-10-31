import { describe, test, expect } from 'vitest'
import { format_filesize } from './format-filesize.ts'

describe('format_filesize', () => {
	test('zero', () => {
		expect(format_filesize(0)).toBe('0 bytes')
	})

	test('single byte', () => {
		expect(format_filesize(1)).toBe('1 byte')
	})

	test('bytes', () => {
		expect(format_filesize(116)).toBe('116 bytes')
		expect(format_filesize(500)).toBe('500 bytes')
		expect(format_filesize(999)).toBe('999 bytes')
	})

	test('kilobytes', () => {
		expect(format_filesize(1000)).toBe('1 kB')
		expect(format_filesize(1500)).toBe('1.5 kB')
	})

	test('megabytes', () => {
		expect(format_filesize(1_000_000)).toBe('1 MB')
		expect(format_filesize(2_500_000)).toBe('2.5 MB')
	})

	test('values beyond megabytes stay in MB', () => {
		expect(format_filesize(2_000_000_000)).toBe('2,000 MB')
	})

	test('negative values', () => {
		expect(format_filesize(-1)).toBe('-1 byte')
		expect(format_filesize(-500)).toBe('-500 bytes')
		expect(format_filesize(-1000)).toBe('-1 kB')
	})

	test('maximumSignificantDigits caps at 3', () => {
		expect(format_filesize(1_234_567)).toBe('1.23 MB')
		expect(format_filesize(12_345)).toBe('12.3 kB')
	})

	test('negative zero keeps its sign', () => {
		expect(format_filesize(-0)).toBe('-0 bytes')
	})

	test('picks the unit before rounding', () => {
		expect(format_filesize(999_999)).toBe('1,000 kB')
		expect(format_filesize(999_999_999)).toBe('1,000 MB')
	})
})
