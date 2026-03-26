import { error } from '@sveltejs/kit'
import type { Actions } from './$types'
import stylelint from 'stylelint'

const presets = ['recommended', 'performance', 'none'] as const
export type Preset = (typeof presets)[number]
const DEFAULT_PRESET = presets[0]
const PRESET_MAP: Record<Preset, string[] | null> = {
	recommended: ['@projectwallace/stylelint-plugin/configs/recommended'],
	performance: ['@projectwallace/stylelint-plugin/configs/performance'],
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
				extends: PRESET_MAP[preset] ?? [],
				rules: []
			},
			code: css?.toString(),
			configBasedir: process.cwd()
		})

		const lint_report = JSON.parse(lint_result.report)

		if (!Array.isArray(lint_report)) {
			error(500)
		}

		const file = lint_report.at(0)
		const return_data = {
			...file,
			warnings: file.warnings?.toSorted((a: StylelintIssue, b: StylelintIssue) => {
				if (a.line === b.line) {
					return a.column - b.column
				}
				return a.line - b.line
			})
		} as { errored: boolean; warnings: StylelintIssue[] }

		const duration = performance.now() - start
		setHeaders({ 'Server-Timing': `lint;dur=${duration.toFixed(1)}` })

		return {
			result: return_data,
			duration: parseFloat(duration.toFixed(1))
		}
	}
} satisfies Actions
