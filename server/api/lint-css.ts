import stylelint, { type Config } from 'stylelint'
import recommendedConfig from '@projectwallace/stylelint-plugin/configs/recommended'
import performanceConfig from '@projectwallace/stylelint-plugin/configs/performance'
import maintainabilityConfig from '@projectwallace/stylelint-plugin/configs/maintainability'
import correctnessConfig from '@projectwallace/stylelint-plugin/configs/correctness'
import designTokensConfig from '@projectwallace/stylelint-plugin/configs/design-tokens'
import holisticConfig from '@projectwallace/stylelint-plugin/configs/holistic'
import stylelintPlugin from '@projectwallace/stylelint-plugin'
import stylelint_pkg from 'stylelint/package.json'
import plugin_pkg from '@projectwallace/stylelint-plugin/package.json'
import { get_css } from '../get-css.ts'
import { format } from '@projectwallace/format-css'
import { presets, type Preset, DEFAULT_PRESET } from '../../src/lib/lint-preset.ts'

export type { Preset }

const PACKAGES = [stylelint_pkg, plugin_pkg].map(({ name, version, homepage }) => ({ name, version, homepage }))

const PRESET_MAP: Record<Preset, NonNullable<Config['rules']> | undefined> = {
	recommended: recommendedConfig.rules,
	performance: performanceConfig.rules,
	maintainability: maintainabilityConfig.rules,
	correctness: correctnessConfig.rules,
	designtokens: designTokensConfig.rules,
	holistic: holisticConfig.rules
}

type RequestBody = { url?: string; css?: string; preset?: string; prettify?: boolean }

function error_response(status: number, message: string) {
	return Response.json({ message }, { status })
}

/**
 * POST { url?, css?, preset?, prettify? }: lint CSS with Stylelint.
 * This is the only handler that needs Node (Stylelint uses fs/path), see portability.test.ts.
 */
export async function handle_lint_css(request: Request): Promise<Response> {
	let body: RequestBody
	try {
		body = (await request.json()) as RequestBody
	} catch {
		return error_response(400, 'Request body must be valid JSON')
	}
	if (typeof body !== 'object' || body === null) {
		return error_response(400, 'Request body must be a JSON object')
	}
	const raw_preset = body.preset?.toString()

	let css: string
	let url_css: string | undefined

	if (body.url) {
		const origins = await get_css(body.url.toString())
		if ('error' in origins) {
			return error_response(400, origins.error.message)
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

	let rules: NonNullable<Config['rules']> = PRESET_MAP[preset] ?? (Object.create(null) as NonNullable<Config['rules']>)

	const start = performance.now()
	let lint_result: Awaited<ReturnType<typeof stylelint.lint>>
	try {
		lint_result = await stylelint.lint({
			config: {
				plugins: stylelintPlugin,
				rules
			},
			code: css,
			configBasedir: process.cwd()
		})
	} catch {
		return error_response(500, 'Linting failed')
	}

	const file = lint_result.results.at(0)

	if (!file) {
		return error_response(500, 'Linting returned no result')
	}

	const lint_warnings = file.warnings.filter((w) => w.rule !== 'CssSyntaxError')
	const parse_error = file.warnings.find((w) => w.rule === 'CssSyntaxError')

	const return_data = {
		errored: file.invalidOptionWarnings.length > 0 || lint_warnings.some((w) => w.severity === 'error'),
		parse_error,
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
	return Response.json(
		{
			result: return_data,
			duration: parseFloat(duration.toFixed(1)),
			css: url_css,
			packages: PACKAGES
		},
		{ headers: { 'Server-Timing': `lint;dur=${duration.toFixed(1)}` } }
	)
}
