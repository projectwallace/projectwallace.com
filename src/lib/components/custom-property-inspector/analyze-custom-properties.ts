import {
	parse,
	walk,
	type CSSNode,
	is_atrule,
	is_function,
	is_identifier,
	is_declaration
} from '@projectwallace/css-parser'
import { DefinedUsed } from '@projectwallace/css-analyzer/utils/collections'
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
	let tracker = new DefinedUsed<CssLocation>()
	let declared_with_fallback = new Set<string>()

	walk(ast, (node) => {
		if (is_declaration(node)) {
			if (node.property.startsWith('--')) {
				tracker.define(node.property, to_loc(node))
			}
		} else if (is_function(node) && node.name === 'var') {
			let first_child = node.first_child
			let second_child = first_child?.next_sibling

			if (first_child && is_identifier(first_child) && first_child.name.startsWith('--')) {
				let name = first_child.name
				tracker.use(name, to_loc(node))

				// check if it has a fallback value that is a custom property
				if (second_child && !(is_function(second_child) && second_child.name === 'var')) {
					declared_with_fallback.add(name)
				}
			}
		} else if (is_atrule(node) && node.name === 'property' && node.has_prelude) {
			tracker.define(node.prelude.text, to_loc(node))
		}
	})

	let { unused, unknown } = tracker.analyze()
	let { definitions, usages } = tracker.payloads()

	// Definitions and usages together, in source order
	let all_properties = new Map<string, CssLocation[]>()
	for (let name of new Set([...definitions.keys(), ...usages.keys()])) {
		let locations = [...(definitions.get(name) ?? []), ...(usages.get(name) ?? [])]
		all_properties.set(
			name,
			locations.sort((a, b) => a.offset - b.offset)
		)
	}
	all_properties = new Map([...all_properties].sort((a, b) => a[1][0].offset - b[1][0].offset))

	return {
		all: all_properties,
		unused: new Set(unused),
		undeclared: new Set(unknown.filter((name) => !declared_with_fallback.has(name))),
		undeclared_with_fallback: new Set(unknown.filter((name) => declared_with_fallback.has(name)))
	}
}
