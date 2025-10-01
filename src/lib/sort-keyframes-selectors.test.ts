import { test, expect, describe } from 'vitest'
import { normalize, sort as sort_keyframe_selectors } from './sort-keyframes-selectors'

describe('normalize', () => {
	test('should normalize percentage values', () => {
		expect.soft(normalize("10%")).toBe(10)
		expect.soft(normalize("20.5%")).toBe(20.5)
		expect.soft(normalize("3e10%")).toBe(3e10)
	})

	test('should normalize "from" and "to" values', () => {
		expect.soft(normalize("from")).toBe(0)
		expect.soft(normalize("to")).toBe(100)
	})

	test('should return Infinity for unknown values', () => {
		expect.soft(normalize("unknown")).toBe(Infinity)
	})
})

describe('sort', () => {
	test('should sort percentage values', () => {
		expect.soft(["10%", "20.5%", "3e10%"].sort(sort_keyframe_selectors)).toEqual(["10%", "20.5%", "3e10%"])
	})

	test('should sort "from" and "to" values', () => {
		expect.soft(["from", "to"].sort(sort_keyframe_selectors)).toEqual(["from", "to"])
	})

	test('should sort values in ascending order', () => {
		let actual = ["10%", "from", "100%", "20.5%", "to"].sort(sort_keyframe_selectors)
		let expected = ["from", "10%", "20.5%", "100%", "to"]
		expect.soft(actual).toEqual(expected)
	})
})