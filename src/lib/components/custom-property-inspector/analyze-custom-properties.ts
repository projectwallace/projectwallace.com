import {
	parse,
	walk,
	type CSSNode,
	is_atrule,
	is_function,
	is_identifier,
	is_declaration,
	is_custom
} from '@projectwallace/css-parser'
import type { CssLocation } from '#lib/css-location.ts'

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
	let declared = new Set<string>()
	let used = new Set<string>()
	let with_fallback = new Set<string>()
	let all = new Map<string, CssLocation[]>()

	function add(name: string, node: CSSNode) {
		let loc = to_loc(node)
		let locs = all.get(name)
		if (locs) {
			locs.push(loc)
		} else {
			all.set(name, [loc])
		}
	}

	walk(ast, (node) => {
		if (is_declaration(node)) {
			if (is_custom(node.property)) {
				declared.add(node.property)
				add(node.property, node)
			}
		} else if (is_function(node) && node.name === 'var') {
			let name_node = node.first_child
			if (name_node && is_identifier(name_node) && is_custom(name_node.name)) {
				let name = name_node.name
				used.add(name)
				add(name, node)

				// a fallback that is not itself a var() makes the property safe to be undeclared
				let fallback = name_node.next_sibling
				if (fallback && !(is_function(fallback) && fallback.name === 'var')) {
					with_fallback.add(name)
				}
			}
		} else if (is_atrule(node) && node.name === 'property' && node.has_prelude) {
			declared.add(node.prelude.text)
			add(node.prelude.text, node)
		}
	})

	let unused = new Set<string>()
	for (let name of declared) {
		if (!used.has(name)) {
			unused.add(name)
		}
	}

	let undeclared = new Set<string>()
	let undeclared_with_fallback = new Set<string>()
	for (let name of used) {
		if (!declared.has(name)) {
			;(with_fallback.has(name) ? undeclared_with_fallback : undeclared).add(name)
		}
	}

	return { all, unused, undeclared, undeclared_with_fallback }
}
