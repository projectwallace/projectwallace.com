import { test, expect } from 'vitest'
import stylelintPlugin from '@projectwallace/stylelint-plugin'
import { lint } from './lint'
import { PRESET_MAP } from './presets'

// Smoke test for the deep-imported stylelint internals (lintPostcssResult,
// normalizeAllRuleSettings, createPartialStylelintResult, prepareReturnValue).
// If a stylelint upgrade changes their signatures or the shape of the
// `.stylelint` scaffold object they expect, this should fail loudly instead
// of silently linting nothing.
test('flags a known rule violation', async () => {
	const result = await lint([{ id: 'input.css', code: 'a { colour: red !important; }' }], {
		rules: PRESET_MAP.recommended,
		plugins: stylelintPlugin
	})

	const file = result.results.at(0)
	expect(file).toBeDefined()
	expect(file?.warnings.map((w) => w.rule)).toContain('projectwallace/max-important-ratio')
})

test('reports no warnings for clean CSS', async () => {
	const result = await lint([{ id: 'input.css', code: 'a { color: red; }' }], {
		rules: PRESET_MAP.recommended,
		plugins: stylelintPlugin
	})

	const file = result.results.at(0)
	expect(file?.warnings).toEqual([])
})

test('reports a CssSyntaxError for invalid CSS', async () => {
	const result = await lint([{ id: 'input.css', code: `a { background: url('")}` }], {
		rules: PRESET_MAP.recommended,
		plugins: stylelintPlugin
	})

	const file = result.results.at(0)
	expect(file?.warnings.some((w) => w.rule === 'CssSyntaxError')).toBe(true)
})
