import { parse, walk, type CSSNode } from '@projectwallace/css-parser'
import type { CssLocation } from '#lib/css-location.js'
import compat_keys from '#lib/data/compat-keys.generated.json'
import { match_node } from './match-node.js'

function to_loc(node: CSSNode): CssLocation {
	return {
		line: node.line,
		column: node.column,
		offset: node.start,
		length: node.length
	}
}

/**
 * Every occurrence of a Baseline-tracked feature in the CSS, keyed by
 * web-features id. `locations.length` is the usage count; the locations
 * themselves are kept so a DevTools-style panel can jump to each occurrence.
 */
export function analyze(css: string): Map<string, CssLocation[]> {
	let ast = parse(css, {
		parse_atrule_preludes: false,
		parse_selectors: true,
		parse_values: true
	})
	let usages = new Map<string, CssLocation[]>()

	walk(ast, (node) => {
		for (let compat_key of match_node(node)) {
			let feature_id = (compat_keys as Record<string, string>)[compat_key]
			if (!feature_id) continue

			let loc = to_loc(node)
			let locations = usages.get(feature_id)
			if (locations) locations.push(loc)
			else usages.set(feature_id, [loc])
		}
	})

	return usages
}
