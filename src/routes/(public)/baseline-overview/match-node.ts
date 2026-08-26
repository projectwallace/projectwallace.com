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

/**
 * Maps a single AST node to the web-features `compat_features` key(s) it could
 * represent, e.g. a `gap` declaration maps to `css.properties.gap`. Deeper
 * compat keys (e.g. function-argument shapes like `css.types.attr.type_function.angle`)
 * aren't matched here - this only covers the top-level properties, at-rules,
 * selectors and functions that can be read directly off a node.
 */
export function match_node(node: AnyNode): string[] {
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
		return [`css.types.${node.name.toLowerCase()}`]
	}

	return []
}
