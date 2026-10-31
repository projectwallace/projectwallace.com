import { test, expect } from 'vitest'
import { getGroups } from './metric-groups.ts'

test('returns groups with the expected shape', () => {
	const groups = getGroups()
	expect(groups.length).toBeGreaterThan(0)
	for (const group of groups) {
		expect.soft(group.id).toBeTruthy()
		expect.soft(group.title).toBeTruthy()
		expect.soft(group.html).toBeTypeOf('string')
		expect.soft(group.slug).not.toContain('.')
		expect.soft(group.path).toBe(`/docs/metrics/${group.slug}`)
	}
})

test('groups are sorted by meta.order', () => {
	const orders = getGroups().map((g) => parseInt(g.meta.order, 10))
	expect(orders).toEqual([...orders].sort((a, b) => a - b))
})
