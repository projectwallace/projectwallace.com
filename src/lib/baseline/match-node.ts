import {
	type AnyNode,
	is_atrule,
	is_declaration,
	is_function,
	is_identifier,
	is_pseudo_class_selector,
	is_pseudo_element_selector,
	is_value
} from '@projectwallace/css-parser'

const NO_MATCH: string[] = []

/** Maps an AST node to the web-features `compat_features` key(s) it represents (e.g. `gap` → `css.properties.gap`).
 * Covers only top-level properties, at-rules, selectors and functions readable directly off the node. */
export function match_node(node: AnyNode, parent?: AnyNode): string[] {
	if (is_declaration(node)) {
		let property = node.property.toLowerCase()
		let keys = [`css.properties.${property}`]
		let value = node.value
		if (value && is_value(value) && value.first_child && is_identifier(value.first_child)) {
			keys.push(`css.properties.${property}.${value.first_child.name.toLowerCase()}`)
		}
		return keys
	}

	if (is_atrule(node)) {
		return [`css.at-rules.${node.name.toLowerCase()}`]
	}

	if (is_pseudo_class_selector(node) || is_pseudo_element_selector(node)) {
		return [`css.selectors.${node.name.toLowerCase()}`]
	}

	if (is_function(node)) {
		let name = node.name.toLowerCase()

		// `type()` is reused as syntax both by `attr()`'s advanced type argument
		// (CSS Values 5) and by `@function`'s parameter type hints (CSS Functions
		// & Mixins). Only the immediate parent tells them apart - without it this
		// falls through to `css.types.type`, which belongs to `@function`.
		if (name === 'type' && parent && is_function(parent) && parent.name.toLowerCase() === 'attr') {
			return ['css.types.attr.type_function']
		}

		return [`css.types.${name}`]
	}

	return NO_MATCH
}
