import { error } from '@sveltejs/kit'
import type { Actions } from './$types'
import stylelint from 'stylelint'
import recommendedConfig from '@projectwallace/stylelint-plugin/configs/recommended'
import performanceConfig from '@projectwallace/stylelint-plugin/configs/performance'
import stylelintPlugin from '@projectwallace/stylelint-plugin'

const presets = ['recommended', 'performance', 'none'] as const
export type Preset = (typeof presets)[number]
const DEFAULT_PRESET = presets[0]
const PRESET_MAP: Record<Preset, NonNullable<stylelint.Config['rules']> | null> = {
	recommended: recommendedConfig.rules,
	performance: performanceConfig.rules,
	none: null
}

export type StylelintIssue = Pick<stylelint.Warning, 'column' | 'line' | 'rule' | 'text' | 'severity'>

export const actions = {
	default: async ({ request, setHeaders }) => {
		const data = await request.formData()
		const css = data.get('input-css')
		const raw_preset = data.get('preset')?.toString()
		const preset: Preset =
			raw_preset && (presets as readonly string[]).includes(raw_preset) ? (raw_preset as Preset) : DEFAULT_PRESET

		const start = performance.now()
		const lint_result = await stylelint.lint({
			config: {
				plugins: stylelintPlugin,
				rules: PRESET_MAP[preset] ?? []
			},
			code: css?.toString(),
			configBasedir: process.cwd()
		})

		const file = lint_result.results.at(0)

		if (!file) {
			error(500)
		}

		const return_data = {
			errored: file.invalidOptionWarnings.length > 0 || file.warnings.some((w) => w.severity === 'error'),
			warnings: file.warnings
				// .map(({ column, line, rule, text, severity }) => ({ column, line, rule, text, severity }))
				.toSorted((a, b) => {
					if (a.line === b.line) return a.column - b.column
					return a.line - b.line
				})
		}

		const duration = performance.now() - start
		setHeaders({ 'Server-Timing': `lint;dur=${duration.toFixed(1)}` })

		return {
			result: return_data,
			duration: parseFloat(duration.toFixed(1))
		}
	}
} satisfies Actions
