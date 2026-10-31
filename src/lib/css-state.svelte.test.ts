import { test, expect } from 'vitest'
import { CssState } from './css-state.svelte.ts'
import type { CSSOrigin } from './css-origins.ts'

const origins: CSSOrigin[] = [
	{ type: 'raw', css: 'a{color:red}' },
	{ type: 'raw', css: 'b{color:blue}' }
]

function create(prettify = false) {
	const state = new CssState()
	state.should_prettify = prettify
	state.set_origins(origins)
	return state
}

test('set_origins enables all origins and joins their CSS', () => {
	const state = create()
	expect.soft(state.origins).toEqual(origins)
	expect.soft([...state.enabled_origins]).toEqual([0, 1])
	expect.soft(state.css).toBe('a{color:red}b{color:blue}')
	expect.soft(state.run_id).toBeTypeOf('string')
})

test('set_origins resets selection and generates a new run_id', () => {
	const state = create()
	const first_run = state.run_id
	state.select_origin_at(1)
	state.select_item({ type: 'x', value: 'y', locations: [] })
	state.set_origins(origins)
	expect.soft(state.selected_origin).toBeUndefined()
	expect.soft(state.selected_item).toBeUndefined()
	expect.soft(state.selected_location).toBeUndefined()
	expect.soft(state.run_id).not.toBe(first_run)
})

test('disable and enable a single origin', () => {
	const state = create()
	state.disable_origin_at(0)
	expect.soft(state.css).toBe('b{color:blue}')
	state.enable_origin_at(0)
	// Origins are joined in the order they were (re-)enabled
	expect.soft([...state.enabled_origins]).toEqual([1, 0])
	expect.soft(state.css).toBe('b{color:blue}a{color:red}')
})

test('enable_origins_at only enables the given indices', () => {
	const state = create()
	state.enable_origins_at([1])
	expect(state.css).toBe('b{color:blue}')
})

test('disable_all_origins and enable_all_origins', () => {
	const state = create()
	state.select_item({ type: 'x', value: 'y', locations: [] })
	state.disable_all_origins()
	expect.soft(state.css).toBe('')
	expect.soft(state.selected_item).toBeUndefined()
	state.enable_all_origins()
	expect.soft(state.css).toBe('a{color:red}b{color:blue}')
})

test('prettify formats CSS and uglify restores raw CSS, both clearing selection', () => {
	const state = create()
	state.select_item({ type: 'x', value: 'y', locations: [] })
	state.prettify()
	expect.soft(state.should_prettify).toBe(true)
	expect.soft(state.css).toContain('\n')
	expect.soft(state.selected_item).toBeUndefined()
	state.uglify()
	expect.soft(state.should_prettify).toBe(false)
	expect.soft(state.css).toBe('a{color:red}b{color:blue}')
})

test('select_item, is_selected and unselect_item', () => {
	const state = create()
	state.select_item({ type: 'color', node_type: undefined, value: '#fff', locations: [] })
	expect.soft(state.selected_location).toBe(0)
	expect.soft(state.is_selected('color', '#fff')).toBe(true)
	expect.soft(state.is_selected('color', '#000')).toBe(false)
	expect.soft(state.is_selected('other', '#fff')).toBe(false)
	state.unselect_item()
	expect.soft(state.selected_item).toBeUndefined()
	expect.soft(state.is_selected('color', '#fff')).toBe(false)
})

test('select and unselect origin and location', () => {
	const state = create()
	state.select_origin_at(1)
	expect.soft(state.selected_origin).toBe(1)
	state.unselect_origin()
	expect.soft(state.selected_origin).toBeUndefined()
	state.select_location_at(3)
	expect.soft(state.selected_location).toBe(3)
	state.unselect_location()
	expect.soft(state.selected_location).toBeUndefined()
})

test('get_css_at returns raw or formatted CSS of one origin', () => {
	const state = create()
	expect.soft(state.get_css_at(1)).toBe('b{color:blue}')
	state.should_prettify = true
	expect.soft(state.get_css_at(1)).toContain('\n')
})
