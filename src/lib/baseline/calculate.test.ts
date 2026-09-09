import { describe, test, expect } from 'vitest'
import { analyze } from './calculate'

describe('analyze', () => {
	test('empty css has no usages', () => {
		expect(analyze('').size).toBe(0)
	})

	test('a declaration is recorded under its feature id', () => {
		let usages = analyze('a { gap: 1px }')
		expect(usages.get('grid')).toHaveLength(1)
	})

	test('an at-rule is recorded under its feature id', () => {
		let usages = analyze('@container (min-width: 100px) { a { color: red } }')
		expect(usages.get('container-queries')).toHaveLength(1)
	})

	test('repeated usage of the same feature accumulates locations', () => {
		let usages = analyze('a { gap: 1px } b { gap: 2px }')
		expect(usages.get('grid')).toHaveLength(2)
	})

	test('a property with no compat mapping is not recorded', () => {
		let usages = analyze('a { not-a-real-property: 1px }')
		expect(usages.size).toBe(0)
	})

	test('locations carry line, column, offset and length', () => {
		let usages = analyze('a {\n\tgap: 1px;\n}')
		let locations = usages.get('grid')
		expect(locations).toEqual([{ line: 2, column: 2, offset: 5, length: 9 }])
	})

	test('type() inside attr() is disambiguated from a bare type() call', () => {
		let usages = analyze('a { content: attr(data-x type(<color>)) }')
		expect(usages.get('attr')).toHaveLength(1)
	})
})
