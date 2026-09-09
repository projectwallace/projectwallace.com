import { describe, test, expect } from 'vitest'
import {
	parse,
	traverse,
	type AnyNode,
	is_declaration,
	is_atrule,
	is_pseudo_class_selector,
	is_pseudo_element_selector,
	is_function
} from '@projectwallace/css-parser'
import { match_node } from './match-node'

/** Parses `css` and returns match_node's result for every node matched by `predicate`. */
function match_where(css: string, predicate: (node: AnyNode) => boolean) {
	let ast = parse(css, { parse_atrule_preludes: false, parse_selectors: true, parse_values: true })
	let results: string[] = []
	let ancestors: AnyNode[] = []

	traverse(ast, {
		enter(node) {
			let parent = ancestors[ancestors.length - 1]
			if (predicate(node)) {
				results.push(...match_node(node, parent))
			}
			ancestors.push(node)
		},
		leave() {
			ancestors.pop()
		}
	})

	return results
}

describe('match_node', () => {
	test('declaration maps to its property', () => {
		expect(match_where('a { gap: 1px }', is_declaration)).toContain('css.properties.gap')
	})

	test('declaration with a keyword first value adds a value-specific key', () => {
		expect(match_where('a { position: absolute }', is_declaration)).toEqual([
			'css.properties.position',
			'css.properties.position.absolute'
		])
	})

	test('declaration with a non-identifier value only maps to the property', () => {
		expect(match_where('a { width: 1px }', is_declaration)).toEqual(['css.properties.width'])
	})

	test('property names are lowercased', () => {
		expect(match_where('a { GAP: 1px }', is_declaration)).toContain('css.properties.gap')
	})

	test('at-rule maps to its name', () => {
		expect(match_where('@container (min-width: 100px) { a { color: red } }', is_atrule)).toContain(
			'css.at-rules.container'
		)
	})

	test('pseudo-class selector maps to its name', () => {
		expect(match_where('a:hover { color: red }', is_pseudo_class_selector)).toContain('css.selectors.hover')
	})

	test('pseudo-element selector maps to its name', () => {
		expect(match_where('a::before { color: red }', is_pseudo_element_selector)).toContain('css.selectors.before')
	})

	test('function maps to its name', () => {
		expect(match_where('a { width: clamp(1px, 2px, 3px) }', is_function)).toContain('css.types.clamp')
	})

	test('type() inside attr() maps to the attr type-function key', () => {
		expect(match_where('a { content: attr(data-x type(<color>)) }', is_function)).toContain(
			'css.types.attr.type_function'
		)
	})

	test('type() outside attr() falls back to the generic type key', () => {
		expect(match_where('a { width: type(<length>) }', is_function)).toContain('css.types.type')
	})

	test('a node with no compat mapping returns an empty array', () => {
		let ast = parse('a { gap: 1px }', { parse_atrule_preludes: false, parse_selectors: true, parse_values: true })
		expect(match_node(ast)).toEqual([])
	})
})
