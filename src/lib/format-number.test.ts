import { test, expect } from 'vitest'
import { format_number, format_percentage } from './format-number.ts'

test('formats integers', () => {
	expect.soft(format_number(0)).toBe('0')
	expect.soft(format_number(5)).toBe((5).toLocaleString())
	expect.soft(format_number(1000)).toBe((1000).toLocaleString())
})

test('formats floats with 3 decimals by default', () => {
	expect.soft(format_number(1.23456)).toBe('1.235')
	expect.soft(format_number(0.5)).toBe('0.500')
})

test('respects custom decimals', () => {
	expect.soft(format_number(1.23456, { decimals: 1 })).toBe('1.2')
	expect.soft(format_number(1.5, { decimals: 0 })).toBe('2')
})

test('NaN becomes 0', () => {
	expect.soft(format_number(NaN)).toBe('0')
})

test('accepts numeric strings', () => {
	expect.soft(format_number('1.5')).toBe('1.500')
})

test('format_percentage', () => {
	expect.soft(format_percentage(0.5)).toBe('50%')
	expect.soft(format_percentage(0)).toBe('0%')
	expect.soft(format_percentage(1)).toBe('100%')
	expect.soft(format_percentage(0.12345)).toBe('12.35%')
	expect.soft(format_percentage(0.12345, { decimals: 1 })).toBe('12.3%')
})
