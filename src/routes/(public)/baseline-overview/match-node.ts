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
 * selectors and functions that can be read directly off a node, plus the
 * `type()` type-hint function which needs its immediate parent to disambiguate
 * from `@function`'s identically-named `type()` syntax.
 */
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

	return []
}
