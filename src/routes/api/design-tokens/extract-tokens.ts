import { parse, walk, parse_selector_list, STYLE_RULE, DECLARATION } from '@projectwallace/css-parser'
import { calculateSpecificity, compareSpecificity, type Specificity } from '@projectwallace/css-analyzer'
import { COMPONENT_PRESETS, DESIGN_TOKEN_PROPERTY_PREFIXES, STATE_PSEUDO_CLASSES, type Component } from './component-presets'

export type TokenDeclaration = {
	property: string
	value: string
	important: boolean
}

export type Rule = {
	selector_text: string
	declarations: TokenDeclaration[]
	order_index: number
}

/** Walk a stylesheet once and collect every style rule (incl. ones nested in @media/@supports). */
export function parse_rules(css: string): Rule[] {
	let ast
	try {
		ast = parse(css, { parse_selectors: false })
	} catch {
		return []
	}

	let rules: Rule[] = []
	let order_index = 0

	walk(ast, (node) => {
		if (node.type === STYLE_RULE) {
			let selector_text = node.has_prelude ? node.prelude.text : ''
			let declarations: TokenDeclaration[] = []

			if (node.has_block) {
				for (let child of node.block.children) {
					if (child.type === DECLARATION) {
						declarations.push({
							property: child.property,
							value: child.value?.text ?? '',
							important: child.is_important
						})
					}
				}
			}

			rules.push({ selector_text, declarations, order_index: order_index++ })
		}
	})

	return rules
}

export type ParsedSelector = {
	text: string
	specificity: Specificity
}

/** Split a rule's (possibly comma-separated) selector text into individual selectors with their specificity. */
export function parse_individual_selectors(selector_list_text: string): ParsedSelector[] {
	if (!selector_list_text.trim()) return []

	try {
		let ast = parse_selector_list(selector_list_text)
		if (!ast.has_children) return []

		let specificities = calculateSpecificity(ast)
		let result: ParsedSelector[] = []

		for (let i = 0; i < ast.children.length; i++) {
			let node = ast.children[i]
			let specificity = specificities[i]
			if (node && specificity) {
				result.push({ text: node.text, specificity })
			}
		}

		return result
	} catch {
		return []
	}
}

const STATE_PSEUDO_REGEX = new RegExp(`:(?:${STATE_PSEUDO_CLASSES.join('|')})\\b`, 'g')

/**
 * A static DOM has no real :hover/:focus state, so element.matches() can never
 * see it. Strip interaction pseudo-classes off before matching and remember
 * which state(s) they represented instead.
 */
export function strip_state_pseudo_classes(selector: string): { structural: string; states: string[] } {
	let states: string[] = []
	let structural = selector.replace(STATE_PSEUDO_REGEX, (match) => {
		let state = match.slice(1)
		if (!states.includes(state)) states.push(state)
		return ''
	})
	return { structural: structural.trim(), states }
}

export function filter_design_tokens(declarations: TokenDeclaration[]): TokenDeclaration[] {
	return declarations.filter((decl) => DESIGN_TOKEN_PROPERTY_PREFIXES.some((prefix) => decl.property.startsWith(prefix)))
}

export type PropertyMatch = {
	/** Empty array = applies unconditionally (base state). */
	states: string[]
	selector_text: string
	property: string
	value: string
	important: boolean
	specificity: Specificity
	order_index: number
}

/** For every element, find every rule whose selector structurally matches it and collect its design-token declarations. */
export function match_elements(elements: Element[], rules: Rule[]): Map<Element, PropertyMatch[]> {
	let result = new Map<Element, PropertyMatch[]>()

	for (let rule of rules) {
		let token_declarations = filter_design_tokens(rule.declarations)
		if (token_declarations.length === 0) continue

		for (let selector of parse_individual_selectors(rule.selector_text)) {
			// Pseudo-elements (::before, ::after, ...) style a generated box, not the element itself - out of scope for v1.
			if (selector.text.includes('::')) continue

			let { structural, states } = strip_state_pseudo_classes(selector.text)
			if (!structural) continue

			for (let element of elements) {
				let matches: boolean
				try {
					matches = element.matches(structural)
				} catch {
					continue
				}
				if (!matches) continue

				let entries = result.get(element)
				if (!entries) {
					entries = []
					result.set(element, entries)
				}

				for (let decl of token_declarations) {
					entries.push({
						states,
						selector_text: selector.text,
						property: decl.property,
						value: decl.value,
						important: decl.important,
						specificity: selector.specificity,
						order_index: rule.order_index
					})
				}
			}
		}
	}

	return result
}

export type ResolvedTokens = { base: Record<string, string> } & Record<string, Record<string, string>>

/** Resolve the CSS cascade (!important > specificity > source order) per state, layering each state's overrides on top of the base state. */
export function resolve_tokens(matches: PropertyMatch[]): ResolvedTokens {
	let all_states = new Set<string>()
	for (let match of matches) {
		for (let state of match.states) all_states.add(state)
	}

	function resolve_for(predicate: (match: PropertyMatch) => boolean): Record<string, string> {
		let sorted = matches.filter(predicate).toSorted((a, b) => {
			if (a.important !== b.important) return a.important ? 1 : -1
			// compareSpecificity(x, y) is negative when x is MORE specific than y (descending
			// comparator), so args are flipped here to get ascending order - least specific
			// first, most specific last, so the last entry in the sorted array "wins".
			let specificity_comparison = compareSpecificity(b.specificity, a.specificity)
			if (specificity_comparison !== 0) return specificity_comparison
			return a.order_index - b.order_index
		})

		let resolved: Record<string, string> = {}
		for (let entry of sorted) {
			resolved[entry.property] = entry.value
		}
		return resolved
	}

	let result: ResolvedTokens = { base: resolve_for((match) => match.states.length === 0) }

	for (let state of all_states) {
		result[state] = resolve_for((match) => match.states.length === 0 || match.states.includes(state))
	}

	return result
}

export type ComponentTokenResult = {
	tag: string
	class_name: string
	matched_selectors: string[]
	tokens: ResolvedTokens
}

export function extract_design_tokens(document: Document, css: string, component: Component): ComponentTokenResult[] {
	let selector = COMPONENT_PRESETS[component].join(', ')
	let elements = Array.from(document.querySelectorAll(selector)) as Element[]
	if (elements.length === 0) return []

	let rules = parse_rules(css)
	let matches_by_element = match_elements(elements, rules)

	let results: ComponentTokenResult[] = []
	for (let element of elements) {
		let matches = matches_by_element.get(element)
		if (!matches || matches.length === 0) continue

		results.push({
			tag: element.tagName.toLowerCase(),
			class_name: element.getAttribute('class') ?? '',
			matched_selectors: Array.from(new Set(matches.map((match) => match.selector_text))),
			tokens: resolve_tokens(matches)
		})
	}

	return results
}

export type Suggestion = {
	tokens: ResolvedTokens
	count: number
	examples: string[]
}

/** Group elements that resolved to an identical base token set - the simplest possible "suggested combination" list. */
export function group_suggestions(results: ComponentTokenResult[]): Suggestion[] {
	let groups = new Map<string, Suggestion>()

	for (let result of results) {
		let key = JSON.stringify(result.tokens.base)
		let example = result.class_name ? `${result.tag}.${result.class_name.trim().split(/\s+/).join('.')}` : result.tag

		let group = groups.get(key)
		if (group) {
			group.count++
			if (group.examples.length < 5) group.examples.push(example)
		} else {
			groups.set(key, { tokens: result.tokens, count: 1, examples: [example] })
		}
	}

	return Array.from(groups.values()).toSorted((a, b) => b.count - a.count)
}
