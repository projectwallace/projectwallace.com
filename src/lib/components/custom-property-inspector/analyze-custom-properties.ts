import { parse, walk, DECLARATION, FUNCTION, AT_RULE, IDENTIFIER } from '@projectwallace/css-parser'
import type { CSSNode } from '@projectwallace/css-parser'
import type { CssLocation } from '$lib/css-location'

function to_loc(node: CSSNode): CssLocation {
	return {
		line: node.line,
		column: node.column,
		offset: node.start,
		length: node.length
	}
}

export function analyze(css: string) {
	let ast = parse(css)
	let declared_properties = new Set<string>()
	let used_properties = new Set<string>()
	let all_properties = new Map<string, CssLocation[]>()
	let declared_with_fallback = new Set<string>()

	// Helper to recursively walk values and find all var() functions
	function walk_values(value_node: CSSNode, declaration_node: CSSNode) {
		if (value_node.type === FUNCTION && value_node.name === 'var') {
			let first_child = value_node.first_child
			if (first_child !== null && first_child.type === IDENTIFIER && first_child.name.startsWith('--')) {
				let loc = to_loc(declaration_node)
				let name = first_child.name
				used_properties.add(name)
				all_properties.set(name, (all_properties.get(name) ?? []).concat(loc))

				// check if it has a fallback value that is a custom property
				let children = value_node.children
				let second_child = children[1]
				if (second_child !== undefined && !(second_child.type === FUNCTION && second_child.name === 'var')) {
					declared_with_fallback.add(name)
				}
			}
		}

		// Recursively walk children to find nested var() calls
		for (let child of value_node.children) {
			walk_values(child, declaration_node)
		}
	}

	walk(ast, (node: CSSNode) => {
		if (node.type === DECLARATION) {
			if (node.property.startsWith('--')) {
				let loc = to_loc(node)
				let name = node.property
				declared_properties.add(name)
				all_properties.set(name, (all_properties.get(name) ?? []).concat(loc))
			}

			// Check for var() usage in declaration values (recursively)
			for (let value of node.values) {
				walk_values(value, node)
			}
		} else if (node.type === AT_RULE && node.name === 'property') {
			let name = node.prelude!
			let loc = to_loc(node)
			declared_properties.add(name)
			all_properties.set(name, (all_properties.get(name) ?? []).concat(loc))
		}
	})

	let unused_properties = new Set<string>()
	outer_declared: for (let declared of declared_properties) {
		for (let used of used_properties) {
			if (used === declared) {
				continue outer_declared
			}
		}

		unused_properties.add(declared)
	}

	let undeclared_properties = new Set<string>()
	let undeclared_with_fallback = new Set<string>()
	outer_undeclared: for (let used of used_properties) {
		for (let declared of declared_properties) {
			if (used === declared) {
				continue outer_undeclared
			}
		}
		for (let declared of declared_with_fallback) {
			if (used === declared) {
				undeclared_with_fallback.add(used)
				continue outer_undeclared
			}
		}

		undeclared_properties.add(used)
	}

	return {
		all: all_properties,
		unused: unused_properties,
		undeclared: undeclared_properties,
		undeclared_with_fallback
	}
}
