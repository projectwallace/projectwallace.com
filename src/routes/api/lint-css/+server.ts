import { error, json } from '@sveltejs/kit'
import stylelint, { type Config } from 'stylelint'
import recommendedConfig from '@projectwallace/stylelint-plugin/configs/recommended'
import performanceConfig from '@projectwallace/stylelint-plugin/configs/performance'
import maintainabilityConfig from '@projectwallace/stylelint-plugin/configs/maintainability'
import correctnessConfig from '@projectwallace/stylelint-plugin/configs/correctness'
import designTokensConfig from '@projectwallace/stylelint-plugin/configs/design-tokens'
import holisticConfig from '@projectwallace/stylelint-plugin/configs/holistic'
import stylelintPlugin from '@projectwallace/stylelint-plugin'
import { get_css } from '../get-css/get-css'
import { format } from '@projectwallace/format-css'
import type { RequestHandler } from './$types'

const presets = ['recommended', 'performance', 'maintainability', 'correctness', 'designtokens', 'holistic'] as const
export type Preset = (typeof presets)[number]
const DEFAULT_PRESET = presets[0]
const PRESET_MAP: Record<Preset, NonNullable<Config['rules']> | null> = {
	recommended: recommendedConfig.rules,
	performance: performanceConfig.rules,
	maintainability: maintainabilityConfig.rules,
	correctness: correctnessConfig.rules,
	designtokens: designTokensConfig.rules,
	holistic: holisticConfig.rules
}

export const POST: RequestHandler = async ({ request, setHeaders }) => {
	const body = await request.json()
	const raw_preset = body.preset?.toString()

	let css: string
	let url_css: string | undefined

	if (body.url) {
		const origins = await get_css(body.url.toString())
		if ('error' in origins) {
			error(400, origins.error.message)
		}
		css = origins.map((o) => o.css).join('\n')
		if (body.prettify) {
			css = format(css)
		}
		url_css = css
	} else {
		css = body.css?.toString() ?? ''
	}
	const preset: Preset =
		raw_preset && (presets as readonly string[]).includes(raw_preset) ? (raw_preset as Preset) : DEFAULT_PRESET

	let rules: NonNullable<Config['rules']> = PRESET_MAP[preset] ?? {}

	const start = performance.now()
	const lint_result = await stylelint.lint({
		config: {
			plugins: stylelintPlugin,
			rules
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
		parse_error: parse_error ? parse_error : null,
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

	return json({
		result: return_data,
		duration: parseFloat(duration.toFixed(1)),
		css: url_css,
		rules
	})
}
