import { test, expect } from 'vitest'
import { validate } from './sort-time.ts'

test('valid times', () => {
	expect.soft(validate('1s')).toBe(true)
	expect.soft(validate('100ms')).toBe(true)
	expect.soft(validate('0s')).toBe(true)
	expect.soft(validate('.5s')).toBe(true)
})

test('negative times are invalid', () => {
	expect.soft(validate('-1s')).toBe(false)
	expect.soft(validate('-100ms')).toBe(false)
})

test('non-time values are invalid', () => {
	expect.soft(validate('foo')).toBe(false)
	expect.soft(validate('10px')).toBe(false)
	expect.soft(validate('')).toBe(false)
})
