import { parse, walk, DECLARATION, FUNCTION, AT_RULE, IDENTIFIER, type CSSNode } from '@projectwallace/css-parser'
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
	let ast = parse(css, {
		parse_selectors: false
	})
	let declared_properties = new Set<string>()
	let used_properties = new Set<string>()
	let all_properties = new Map<string, CssLocation[]>()
	let declared_with_fallback = new Set<string>()

	walk(ast, (node) => {
		if (node.type === DECLARATION) {
			let property = node.property!
			if (property.startsWith('--')) {
				let name = property
				let loc = to_loc(node)
				declared_properties.add(name)
				let locs = all_properties.get(name)
				if (locs) locs.push(loc)
				else all_properties.set(name, [loc])
			}
		} else if (node.type === FUNCTION && node.name === 'var') {
			let [first_child, second_child] = node.children

			if (
				first_child !== null &&
				first_child.type === IDENTIFIER &&
				typeof first_child.name === 'string' &&
				first_child.name.startsWith('--')
			) {
				let loc = to_loc(node)
				let name = first_child.name
				used_properties.add(name)
				let locs = all_properties.get(name)
				if (locs) locs.push(loc)
				else all_properties.set(name, [loc])

				// check if it has a fallback value that is a custom property
				if (second_child !== undefined && !(second_child.type === FUNCTION && second_child.name === 'var')) {
					declared_with_fallback.add(name)
				}
			}
		} else if (node.type === AT_RULE && node.name === 'property' && node.prelude) {
			let name = node.prelude.text
			let loc = to_loc(node)
			declared_properties.add(name)
			let locs = all_properties.get(name)
			if (locs) locs.push(loc)
			else all_properties.set(name, [loc])
		}
	})

	let unused_properties = new Set<string>()
	for (let declared of declared_properties) {
		if (!used_properties.has(declared)) {
			unused_properties.add(declared)
		}
	}

	let undeclared_properties = new Set<string>()
	let undeclared_with_fallback = new Set<string>()
	for (let used of used_properties) {
		if (!declared_properties.has(used)) {
			if (declared_with_fallback.has(used)) {
				undeclared_with_fallback.add(used)
			} else {
				undeclared_properties.add(used)
			}
		}
	}

	return {
		all: all_properties,
		unused: unused_properties,
		undeclared: undeclared_properties,
		undeclared_with_fallback
	}
}
