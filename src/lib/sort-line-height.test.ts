import { test, expect } from 'vitest'
import { normalize_line_height, MAX } from './sort-line-height'

test('`normal` keyword', () => {
	expect.soft(normalize_line_height('normal')).toBe(1.5 * 16)
	expect.soft(normalize_line_height('Normal')).toBe(1.5 * 16)
})

test('unitless number', () => {
	expect.soft(normalize_line_height('1')).toBe(16)
	expect.soft(normalize_line_height('1.5')).toBe(16 * 1.5)
	expect.soft(normalize_line_height('2')).toBe(16 * 2)
	expect.soft(normalize_line_height('0')).toBe(0)
	expect.soft(normalize_line_height('-0')).toBe(-0)
	expect.soft(normalize_line_height('+0')).toBe(0)
	expect.soft(normalize_line_height('2e3')).toBe(16 * 2000)
	expect.soft(normalize_line_height('1.2e1')).toBe(16 * 12)
	expect.soft(normalize_line_height('1.2e-1')).toBe(16 * 1.2 * 0.1)
})

test('em unit', () => {
	expect.soft(normalize_line_height('1em')).toBe(16)
	expect.soft(normalize_line_height('1.5em')).toBe(16 * 1.5)
	expect.soft(normalize_line_height('2em')).toBe(16 * 2)
	expect.soft(normalize_line_height('0em')).toBe(0)
	expect.soft(normalize_line_height('2e3em')).toBe(16 * 2000)
	expect.soft(normalize_line_height('3EM')).toBe(16 * 3)
	expect.soft(normalize_line_height('broem')).toBe(MAX)
})

test('rem unit', () => {
	expect.soft(normalize_line_height('1rem')).toBe(16)
	expect.soft(normalize_line_height('1.5rem')).toBe(16 * 1.5)
	expect.soft(normalize_line_height('2rem')).toBe(16 * 2)
	expect.soft(normalize_line_height('0rem')).toBe(0)
	expect.soft(normalize_line_height('2e3rem')).toBe(16 * 2000)
	expect.soft(normalize_line_height('3REM')).toBe(16 * 3)
	expect.soft(normalize_line_height('foo-rem')).toBe(MAX)
})

test('px unit', () => {
	expect.soft(normalize_line_height('16px')).toBe(16)
	expect.soft(normalize_line_height('24px')).toBe(24)
	expect.soft(normalize_line_height('32px')).toBe(32)
	expect.soft(normalize_line_height('0px')).toBe(0)
	expect.soft(normalize_line_height('2e3px')).toBe(2000)
	expect.soft(normalize_line_height('1.2px')).toBe(1.2)
	expect.soft(normalize_line_height('10PX')).toBe(10)
	expect.soft(normalize_line_height('foo-px')).toBe(MAX)
})

test('percentage unit', () => {
	expect.soft(normalize_line_height('100%')).toBe(16)
	expect.soft(normalize_line_height('150%')).toBe(24)
	expect.soft(normalize_line_height('200%')).toBe(32)
	expect.soft(normalize_line_height('2e2%')).toBe(32)
	expect.soft(normalize_line_height('foo%')).toBe(MAX)
})

test('var()', () => {
	expect.soft(normalize_line_height('var(--line-height)')).toBe(MAX)
	expect.soft(normalize_line_height('VAR(--line-height)')).toBe(MAX)
})

test('calc()', () => {
	expect.soft(normalize_line_height('calc(1em + 2px)')).toBe(MAX)
	expect.soft(normalize_line_height('CALC(1em + 2px)')).toBe(MAX)
})