import { test, expect } from 'vitest'
import { extract_root_custom_properties, resolve_css_value } from './resolve-css-variables'

test('extracts custom properties declared on :root', () => {
	let result = extract_root_custom_properties(':root { --primary-color: blue; --radius: 4px; }')

	expect(result).toEqual(
		new Map([
			['--primary-color', 'blue'],
			['--radius', '4px']
		])
	)
})

test('extracts custom properties declared on html', () => {
	let result = extract_root_custom_properties('html { --primary-color: green; }')

	expect(result).toEqual(new Map([['--primary-color', 'green']]))
})

test('ignores custom properties declared on any other selector', () => {
	let result = extract_root_custom_properties('.theme-dark { --primary-color: black; }')

	expect(result.size).toBe(0)
})

test('ignores custom properties nested inside a conditional at-rule', () => {
	let result = extract_root_custom_properties(`
		@media (prefers-color-scheme: dark) {
			:root { --primary-color: black; }
		}
	`)

	expect(result.size).toBe(0)
})

test('ignores non-custom-property declarations', () => {
	let result = extract_root_custom_properties(':root { --primary-color: blue; font-size: 16px; }')

	expect(result).toEqual(new Map([['--primary-color', 'blue']]))
})

test('resolves the cascade between multiple :root/html declarations of the same property', () => {
	// html has lower specificity than :root, so :root should win regardless of source order
	let result = extract_root_custom_properties(`
		:root { --primary-color: blue; }
		html { --primary-color: green; }
	`)

	expect(result.get('--primary-color')).toBe('blue')
})

test('equal specificity: the later declaration wins', () => {
	let result = extract_root_custom_properties(`
		:root { --primary-color: blue; }
		:root { --primary-color: green; }
	`)

	expect(result.get('--primary-color')).toBe('green')
})

test('!important beats higher specificity', () => {
	let result = extract_root_custom_properties(`
		:root { --primary-color: blue !important; }
		:root { --primary-color: green; }
	`)

	expect(result.get('--primary-color')).toBe('blue')
})

test('resolve_css_value substitutes a known variable', () => {
	let custom_properties = new Map([['--primary-color', 'blue']])

	expect(resolve_css_value('var(--primary-color)', custom_properties)).toBe('blue')
	expect(resolve_css_value('1px solid var(--primary-color)', custom_properties)).toBe('1px solid blue')
})

test('resolve_css_value leaves an unknown variable without a fallback untouched', () => {
	expect(resolve_css_value('var(--unknown)', new Map())).toBe('var(--unknown)')
})

test('resolve_css_value uses the fallback when the variable is unknown', () => {
	expect(resolve_css_value('var(--unknown, red)', new Map())).toBe('red')
})

test('resolve_css_value ignores the fallback when the variable is known', () => {
	let custom_properties = new Map([['--primary-color', 'blue']])

	expect(resolve_css_value('var(--primary-color, red)', custom_properties)).toBe('blue')
})

test('resolve_css_value resolves a fallback that itself contains commas inside a function', () => {
	expect(resolve_css_value('var(--unknown, rgb(1, 2, 3))', new Map())).toBe('rgb(1, 2, 3)')
})

test('resolve_css_value resolves chained variable references', () => {
	let custom_properties = new Map([
		['--space', 'var(--space-2)'],
		['--space-2', '8px']
	])

	expect(resolve_css_value('var(--space)', custom_properties)).toBe('8px')
})

test('resolve_css_value resolves a fallback that is itself a variable reference', () => {
	let custom_properties = new Map([['--space-2', '8px']])

	expect(resolve_css_value('var(--gap, var(--space-2))', custom_properties)).toBe('8px')
})

test('resolve_css_value resolves multiple variables within one value', () => {
	let custom_properties = new Map([
		['--c1', 'red'],
		['--c2', 'blue']
	])

	expect(resolve_css_value('linear-gradient(90deg, var(--c1), var(--c2))', custom_properties)).toBe(
		'linear-gradient(90deg, red, blue)'
	)
})

test('resolve_css_value breaks a circular reference instead of looping forever', () => {
	let custom_properties = new Map([
		['--a', 'var(--b)'],
		['--b', 'var(--a)']
	])

	expect(resolve_css_value('var(--a)', custom_properties)).toBe('var(--a)')
})

test('resolve_css_value leaves values without var() untouched', () => {
	expect(resolve_css_value('16px', new Map())).toBe('16px')
})
