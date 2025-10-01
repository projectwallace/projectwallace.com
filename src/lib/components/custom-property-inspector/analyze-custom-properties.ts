import walk from 'css-tree/walker'
import parse from 'css-tree/parser'
import type { CssNode, CssLocation as CssTreeLocation } from 'css-tree'
import type { CssLocation } from '$lib/css-location'

function to_loc(loc: CssTreeLocation): CssLocation {
	return {
		line: loc.start.line,
		column: loc.start.column,
		offset: loc.start.offset,
		length: loc.end.offset - loc.start.offset
	}
}

export function analyze(css: string) {
	let ast = parse(css, {
		positions: true,
		parseCustomProperty: true,
		parseRulePrelude: false,
	})
	let declared_properties = new Set<string>()
	let used_properties = new Set<string>()
	let all_properties = new Map<string, CssLocation[]>()
	let declared_with_fallback = new Set<string>()

	walk(ast, function (node: CssNode) {
		if (node.type === 'Declaration') {
			if (node.property.startsWith('--')) {
				let loc = to_loc(node.loc!)
				let name = node.property
				declared_properties.add(name)
				all_properties.set(name, (all_properties.get(name) ?? []).concat(loc))
			}
		} else if (node.type === 'Function' && node.name === 'var') {
			let first_child = node.children.first
			if (
				first_child !== null &&
				first_child.type === 'Identifier' &&
				first_child.name.startsWith('--')
			) {
				let node_loc = first_child.loc!
				if (this.declaration !== null) {
					node_loc = this.declaration.loc!
				}
				let loc = to_loc(node_loc)
				let name = first_child.name
				used_properties.add(name)
				all_properties.set(name, (all_properties.get(name) ?? []).concat(loc))

				// check if it has a fallback value that is a custom property
				let second_child = node.children.toArray()[1]
				if (second_child !== undefined && !(second_child.type === 'Function' && second_child.name === 'var')) {
					declared_with_fallback.add(name)
				}
			}
		} else if (
			node.type === 'Atrule' &&
			node.name === 'property' &&
			node.prelude !== null &&
			node.prelude.type === 'AtrulePrelude'
		) {
			let first_child = node.prelude.children.first
			if (first_child !== null && first_child.type === 'Identifier') {
				let name = first_child.name
				let loc = to_loc(node.loc!)
				declared_properties.add(name)
				all_properties.set(name, (all_properties.get(name) ?? []).concat(loc))
			}
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
