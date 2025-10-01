import { test, expect } from 'vitest'
import { diffstat_blocks } from './diffstat-blocks'

test('no changes', () => {
	expect(diffstat_blocks(0, 0)).toEqual(new Uint8Array([0, 0, 0, 0, 0]))
})

test('1 addition', () => {
	expect(diffstat_blocks(1, 0)).toEqual(new Uint8Array([2, 0, 0, 0, 0]))
})

test('1 deletion', () => {
	expect(diffstat_blocks(0, 1)).toEqual(new Uint8Array([1, 0, 0, 0, 0]))
})

test('1 addition, 1 deletion', () => {
	expect(diffstat_blocks(1, 1)).toEqual(new Uint8Array([2, 1, 0, 0, 0]))
})

test('2 additions', () => {
	expect(diffstat_blocks(2, 0)).toEqual(new Uint8Array([2, 2, 0, 0, 0]))
})

test('2 deletions', () => {
	expect(diffstat_blocks(0, 2)).toEqual(new Uint8Array([1, 1, 0, 0, 0]))
})

test('3 additions, 3 deletions', () => {
	expect(diffstat_blocks(3, 3)).toEqual(new Uint8Array([2, 2, 1, 1, 0]))
})

test('9 additions, 3 deletions', () => {
	expect(diffstat_blocks(9, 3)).toEqual(new Uint8Array([2, 2, 2, 2, 1]))
})

test('3 additions, 6 deletions', () => {
	expect(diffstat_blocks(3, 6)).toEqual(new Uint8Array([2, 2, 1, 1, 1]))
})

test('5 additions, 30 deletions', () => {
	expect(diffstat_blocks(5, 30)).toEqual(new Uint8Array([2, 1, 1, 1, 1]))
})

test('14 additions, 23 deletions', () => {
	expect(diffstat_blocks(14, 23)).toEqual(new Uint8Array([2, 2, 1, 1, 1]))
})
