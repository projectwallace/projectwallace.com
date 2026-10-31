import { test, expect } from 'vitest'
import { diff_css } from './diff-css.ts'

test('identical CSS has no changes', () => {
	const result = diff_css('a { color: red; }', 'a { color: red; }')
	expect.soft(result.hunks).toEqual([])
	expect.soft(result.lines_added).toBe(0)
	expect.soft(result.lines_removed).toBe(0)
})

test('formatting-only differences are ignored', () => {
	const result = diff_css('a{color:red}', 'a {\n\tcolor: red;\n}')
	expect.soft(result.lines_added).toBe(0)
	expect.soft(result.lines_removed).toBe(0)
})

test('added rule', () => {
	const result = diff_css('a { color: red; }', 'a { color: red; }\nb { color: blue; }')
	expect.soft(result.lines_added).toBeGreaterThan(0)
	expect.soft(result.lines_removed).toBe(0)
	const lines = result.hunks.flatMap((h) => h.lines)
	expect.soft(lines.filter((l) => l.added).map((l) => l.value.trim())).toContain('color: blue;')
})

test('removed rule', () => {
	const result = diff_css('a { color: red; }\nb { color: blue; }', 'a { color: red; }')
	expect.soft(result.lines_added).toBe(0)
	expect.soft(result.lines_removed).toBeGreaterThan(0)
	const lines = result.hunks.flatMap((h) => h.lines)
	expect.soft(lines.filter((l) => l.deleted).map((l) => l.value.trim())).toContain('color: blue;')
})

test('changed declaration is one removal and one addition', () => {
	const result = diff_css('a { color: red; }', 'a { color: blue; }')
	expect.soft(result.lines_added).toBe(1)
	expect.soft(result.lines_removed).toBe(1)
	const lines = result.hunks.flatMap((h) => h.lines)
	expect.soft(lines.filter((l) => l.deleted).map((l) => l.value.trim())).toEqual(['color: red;'])
	expect.soft(lines.filter((l) => l.added).map((l) => l.value.trim())).toEqual(['color: blue;'])
})

test('unchanged lines are neither added nor deleted', () => {
	const result = diff_css('a { color: red; }', 'a { color: blue; }')
	const context = result.hunks.flatMap((h) => h.lines).filter((l) => l.added === l.deleted)
	expect(context.map((l) => l.value.trim())).toEqual(['a {', '}'])
})
