import { test, expect } from 'vitest'
import { normalize_z_index, MAX, INVALID } from '$lib/sort-z-index'

test('valid numbers', () => {
	expect.soft(normalize_z_index('10')).toBe(10)
	expect.soft(normalize_z_index('0')).toBe(0)
	expect.soft(normalize_z_index('+0')).toBe(0)
	expect.soft(normalize_z_index('-0')).toBe(-0)
	expect.soft(normalize_z_index('-5')).toBe(-5)
	// 32-bit integer range
	expect.soft(normalize_z_index(Math.pow(2, 31).toString())).toBe(2147483648)
})

test('scientific notation', () => {
	expect.soft(normalize_z_index('1e3')).toBe(1000)
	expect.soft(normalize_z_index('2.5e2')).toBe(250)
})

test('invalid numbers', () => {
	expect.soft(normalize_z_index('3.14')).toBe(INVALID)
	expect.soft(normalize_z_index('abc')).toBe(INVALID)
	expect.soft(normalize_z_index('10px')).toBe(INVALID)
})

test('var()', () => {
	expect.soft(normalize_z_index('var(--my-var)')).toBe(MAX)
	expect.soft(normalize_z_index('VAR(--my-var)')).toBe(MAX)
})

test('calc()', () => {
	expect.soft(normalize_z_index('calc(1 + 1)')).toBe(MAX)
	expect.soft(normalize_z_index('calc(10)')).toBe(MAX)
	expect.soft(normalize_z_index('CALC(10)')).toBe(MAX)
})