import maintainabilityConfig from '@projectwallace/stylelint-plugin/configs/maintainability'
import correctnessConfig from '@projectwallace/stylelint-plugin/configs/correctness'
import performanceConfig from '@projectwallace/stylelint-plugin/configs/performance'
import designTokensConfig from '@projectwallace/stylelint-plugin/configs/design-tokens'

export const LINT_CATEGORIES = ['correctness', 'performance', 'maintainability', 'designtokens'] as const
export type LintCategory = (typeof LINT_CATEGORIES)[number]

export const LINT_CATEGORY_LABELS: Record<LintCategory, string> = {
	correctness: 'Correctness',
	performance: 'Performance',
	maintainability: 'Maintainability',
	designtokens: 'Design tokens'
}

const CATEGORY_RULES: Record<LintCategory, Set<string>> = {
	correctness: new Set(Object.keys(correctnessConfig.rules ?? {})),
	performance: new Set(Object.keys(performanceConfig.rules ?? {})),
	maintainability: new Set(Object.keys(maintainabilityConfig.rules ?? {})),
	designtokens: new Set(Object.keys(designTokensConfig.rules ?? {}))
}

/**
 * Buckets Stylelint warnings (from a `recommended`-preset lint run, which is the
 * union of the four category presets below) by which category preset(s) each
 * warning's rule belongs to. A rule that's shared between categories (e.g.
 * `no-empty-rules` is both a correctness and a performance rule) is counted in
 * every category it belongs to.
 */
export function summarize_lint_warnings(warnings: { rule: string }[]): Record<LintCategory, number> {
	const counts: Record<LintCategory, number> = {
		correctness: 0,
		performance: 0,
		maintainability: 0,
		designtokens: 0
	}

	for (const warning of warnings) {
		for (const category of LINT_CATEGORIES) {
			if (CATEGORY_RULES[category].has(warning.rule)) {
				counts[category] += 1
			}
		}
	}

	return counts
}
