import { test, expect } from 'vitest'
import { build_nav } from './nav.ts'

test('nests h3 headings under the h2 before them', () => {
	let nav = build_nav(['## One\n\n### One A\n\n### One B\n\n## Two\n\n### Two A'])
	expect(nav).toEqual([
		{
			id: 'one',
			title: 'One',
			items: [
				{ id: 'one-a', title: 'One A' },
				{ id: 'one-b', title: 'One B' }
			]
		},
		{ id: 'two', title: 'Two', items: [{ id: 'two-a', title: 'Two A' }] }
	])
})

test('ignores other heading levels and h3 headings before any h2', () => {
	let nav = build_nav(['### Orphan\n\n# Title\n\n#### Deep\n\n## Real'])
	expect(nav).toEqual([{ id: 'real', title: 'Real', items: [] }])
})

test('continues across sections in the given order and keeps ids unique', () => {
	let nav = build_nav(['## Intro\n\n### Same', '### Same\n\n## Next\n\n### Same'])
	expect(nav.map((h2) => h2.id)).toEqual(['intro', 'next'])
	expect(nav[0].items?.map((item) => item.id)).toEqual(['same', 'same-1'])
	expect(nav[1].items?.map((item) => item.id)).toEqual(['same-2'])
})

test('ignores headings inside fenced code blocks', () => {
	let markdown = [
		'## Real',
		'',
		'```md',
		'## Not a heading',
		'### Neither',
		'```',
		'',
		'~~~',
		'## Nor this',
		'~~~',
		'',
		'### Real child'
	].join('\n')
	let nav = build_nav([markdown])
	expect(nav).toEqual([{ id: 'real', title: 'Real', items: [{ id: 'real-child', title: 'Real child' }] }])
})

test('a fenced block does not swallow headings after it', () => {
	let nav = build_nav(['```\ncode\n```\n\n## After'])
	expect(nav).toEqual([{ id: 'after', title: 'After', items: [] }])
})
