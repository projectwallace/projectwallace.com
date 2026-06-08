import { error, json } from '@sveltejs/kit'
import stylelint from 'stylelint'
import recommendedConfig from '@projectwallace/stylelint-plugin/configs/recommended'
import performanceConfig from '@projectwallace/stylelint-plugin/configs/performance'
import maintainabilityConfig from '@projectwallace/stylelint-plugin/configs/maintainability'
import correctnessConfig from '@projectwallace/stylelint-plugin/configs/correctness'
import stylelintPlugin from '@projectwallace/stylelint-plugin'
import type { RequestHandler } from './$types'

const presets = ['recommended', 'performance', 'maintainability', 'correctness'] as const
export type Preset = (typeof presets)[number]
const DEFAULT_PRESET = presets[0]
const PRESET_MAP: Record<Preset, NonNullable<stylelint.Config['rules']> | null> = {
	recommended: recommendedConfig.rules,
	performance: performanceConfig.rules,
	maintainability: maintainabilityConfig.rules,
	correctness: correctnessConfig.rules
}

export const POST: RequestHandler = async ({ request, setHeaders }) => {
	const body = await request.json()
	const css = body.css
	const raw_preset = body.preset?.toString()
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

	const lint_warnings = file.warnings.filter((w) => w.rule !== 'CssSyntaxError')
	const parse_error = file.warnings.find((w) => w.rule === 'CssSyntaxError')

	const return_data = {
		errored: file.invalidOptionWarnings.length > 0 || lint_warnings.some((w) => w.severity === 'error'),
		parse_error: parse_error ? parse_error.text : null,
		warnings: lint_warnings
			.toSorted((a, b) => {
				if (a.line === b.line) {
					return a.column - b.column
				}
				return a.line - b.line
			})
			.map(({ line, column, endLine, endColumn, text, rule }) => ({
				line,
				column,
				endLine,
				endColumn,
				text,
				rule
			}))
	}

	const duration = performance.now() - start
	setHeaders({ 'Server-Timing': `lint;dur=${duration.toFixed(1)}` })

	return json({ result: return_data, duration: parseFloat(duration.toFixed(1)) })
}
