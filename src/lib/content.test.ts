import { test, expect, vi } from 'vitest'

vi.mock('svelte/server', () => ({
	render: vi.fn<() => { body: string }>(() => ({ body: '<p>rendered</p>' }))
}))

import { render } from 'svelte/server'
import { render_md, require_frontmatter, to_slug } from './content.ts'

test('to_slug', () => {
	expect.soft(to_slug('/content/docs/recipes/Foo.Bar.md')).toBe('foo-bar')
	expect.soft(to_slug('/content/docs/recipes/simple.md')).toBe('simple')
	expect.soft(to_slug('Foo.md')).toBe('foo')
})

test('require_frontmatter passes when all keys are present', () => {
	expect(() => require_frontmatter('Recipe', '/a.md', { title: 'x', order: '1' }, ['title', 'order'])).not.toThrow()
})

test('require_frontmatter throws a descriptive error for missing or empty keys', () => {
	expect(() =>
		require_frontmatter('Recipe', '/a.md', { title: 'x' } as { title: string; order?: string }, ['title', 'order'])
	).toThrow('Recipe at /a.md is missing required frontmatter (title, order)')
	expect(() => require_frontmatter('Recipe', '/a.md', { title: '' }, ['title'])).toThrow(/missing required frontmatter/)
})

test('render_md returns the rendered body', () => {
	const component = () => {}
	const html = render_md({ metadata: {}, default: component as unknown as { render: () => unknown } })
	expect(html).toBe('<p>rendered</p>')
	expect(render).toHaveBeenCalledWith(component, { props: {} })
})
