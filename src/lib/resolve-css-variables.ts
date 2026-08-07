import { parse, traverse, parse_selector_list, STYLE_RULE, AT_RULE, DECLARATION } from '@projectwallace/css-parser'
import { calculateSpecificity, type Specificity } from '@projectwallace/css-analyzer'
import { compareSpecificity } from '@projectwallace/css-analyzer/selectors'

const ROOT_SELECTORS = new Set([':root', 'html'])

type CustomPropertyDeclaration = {
	value: string
	specificity: Specificity
	important: boolean
	order_index: number
}

/**
 * Resolve the winning value for every custom property declared on `:root` or `html`,
 * ignoring anything nested inside a conditional at-rule (@media, @supports, ...) since
 * its value can't be known without evaluating that condition. This intentionally only
 * covers the cases we can be fully sure of - not every custom property on the page.
 */
export function extract_root_custom_properties(css: string): Map<string, string> {
	let ast
	try {
		ast = parse(css, { parse_selectors: false })
	} catch {
		return new Map()
	}

	let declarations_by_property = new Map<string, CustomPropertyDeclaration[]>()
	let order_index = 0
	let at_rule_depth = 0

	traverse(ast, {
		enter(node) {
			if (node.type === AT_RULE) {
				at_rule_depth++
				return
			}

			if (node.type !== STYLE_RULE || at_rule_depth > 0 || !node.has_prelude || !node.has_block) {
				return
			}

			let selector_ast
			try {
				selector_ast = parse_selector_list(node.prelude.text)
			} catch {
				return
			}
			if (!selector_ast.has_children) return

			let specificities = calculateSpecificity(selector_ast)
			let root_specificity: Specificity | undefined

			for (let i = 0; i < selector_ast.children.length; i++) {
				if (ROOT_SELECTORS.has(selector_ast.children[i].text.trim().toLowerCase())) {
					root_specificity = specificities[i]
					break
				}
			}
			if (!root_specificity) return

			for (let child of node.block.children) {
				if (child.type === DECLARATION && child.property.startsWith('--')) {
					let entries = declarations_by_property.get(child.property)
					if (!entries) {
						entries = []
						declarations_by_property.set(child.property, entries)
					}
					entries.push({
						value: child.value?.text ?? '',
						specificity: root_specificity,
						important: child.is_important,
						order_index: order_index++
					})
				}
			}
		},
		leave(node) {
			if (node.type === AT_RULE) {
				at_rule_depth--
			}
		}
	})

	let resolved = new Map<string, string>()
	for (let [property, entries] of declarations_by_property) {
		let winner = entries.toSorted((a, b) => {
			if (a.important !== b.important) return a.important ? 1 : -1
			let specificity_comparison = compareSpecificity(a.specificity, b.specificity)
			if (specificity_comparison !== 0) return specificity_comparison
			return a.order_index - b.order_index
		})[entries.length - 1]!
		resolved.set(property, winner.value)
	}

	return resolved
}

function find_top_level_comma(text: string): number {
	let depth = 0
	for (let i = 0; i < text.length; i++) {
		if (text[i] === '(') depth++
		else if (text[i] === ')') depth--
		else if (text[i] === ',' && depth === 0) return i
	}
	return -1
}

/**
 * Substitute every var(--name) / var(--name, fallback) occurrence in `value` using
 * `custom_properties`, recursively resolving chained references (a variable whose own
 * value contains another var() call). Falls back to the fallback expression - resolving
 * it too - when the variable isn't in the map, and leaves a var() call untouched when it
 * can't be resolved at all (unknown property, no fallback, or a circular reference).
 */
export function resolve_css_value(
	value: string,
	custom_properties: Map<string, string>,
	seen: Set<string> = new Set()
): string {
	let result = ''
	let index = 0

	while (index < value.length) {
		let var_start = value.indexOf('var(', index)
		if (var_start === -1) {
			result += value.slice(index)
			break
		}

		result += value.slice(index, var_start)

		let depth = 0
		let content_start = var_start + 'var('.length
		let content_end = content_start
		for (; content_end < value.length; content_end++) {
			if (value[content_end] === '(') depth++
			else if (value[content_end] === ')') {
				if (depth === 0) break
				depth--
			}
		}

		if (content_end >= value.length) {
			// Unterminated var(...) - nothing sensible to do but keep the rest verbatim.
			result += value.slice(var_start)
			break
		}

		let inner = value.slice(content_start, content_end)
		let comma_index = find_top_level_comma(inner)
		let name = (comma_index === -1 ? inner : inner.slice(0, comma_index)).trim()
		let fallback = comma_index === -1 ? undefined : inner.slice(comma_index + 1).trim()

		if (custom_properties.has(name) && !seen.has(name)) {
			let next_seen = new Set([...seen, name])
			result += resolve_css_value(custom_properties.get(name)!, custom_properties, next_seen)
		} else if (fallback === undefined) {
			result += value.slice(var_start, content_end + 1)
		} else {
			result += resolve_css_value(fallback, custom_properties, seen)
		}

		index = content_end + 1
	}

	return result
}
