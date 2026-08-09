// Runs stylelint's linting core directly in the browser, skipping stylelint's
// `standalone()`/`lint()` entry point (and the file-resolution machinery
// behind it: globby, cosmiconfig, write-file-atomic, ...) since we only ever
// lint in-memory CSS against a single, already-resolved config.
//
// This deep-imports a handful of stylelint internals that aren't part of its
// public `exports` map. They're aliased to real files on disk in
// vite.config.js, and their shapes are pinned via stylelint-internals.d.ts.
// Re-verify both against node_modules/stylelint/lib/*.mjs when bumping the
// stylelint version (pinned in package.json).
import postcss from 'postcss'
import lintPostcssResult from 'stylelint/lib/lintPostcssResult.mjs'
import normalizeAllRuleSettings from 'stylelint/lib/normalizeAllRuleSettings.mjs'
import createPartialStylelintResult from 'stylelint/lib/createPartialStylelintResult.mjs'
import prepareReturnValue from 'stylelint/lib/prepareReturnValue.mjs'
import jsonFormatter from 'stylelint/lib/formatters/jsonFormatter.mjs'
// `lib/utils/*` is publicly exported by stylelint, so this one needs no alias.
import getLexer from 'stylelint/lib/utils/getLexer.mjs'
import type { Config, LinterResult, PostcssResult, Rule } from 'stylelint'

export type LintSource = {
	/** Cosmetic label only (becomes `result.source`); a file path or URL both work. */
	id: string
	code: string
}

type PluginRuleDefinition = { ruleName: string; rule: Rule }

/**
 * Re-implementation of stylelint's `addPluginFunctions` (lib/augmentConfig.mjs),
 * minus the module-resolution branch: plugins must already be imported objects,
 * never string specifiers.
 */
function build_plugin_functions(plugins: Config['plugins']): Record<string, Rule> {
	const plugin_functions: Record<string, Rule> = {}
	if (!plugins) return plugin_functions

	const normalized_plugins = ([] as unknown[]).concat(plugins)

	for (const plugin_lookup of normalized_plugins) {
		if (typeof plugin_lookup === 'string') {
			throw new TypeError(
				`Browser stylelint driver only accepts already-imported plugin objects, got a string: "${plugin_lookup}"`
			)
		}

		const plugin_import = (plugin_lookup as { default?: unknown }).default ?? plugin_lookup
		const rule_definitions = ([] as PluginRuleDefinition[]).concat(plugin_import as PluginRuleDefinition)

		for (const rule_definition of rule_definitions) {
			if (!rule_definition.ruleName) {
				throw new Error('stylelint requires plugins to expose a ruleName.')
			}
			if (!rule_definition.ruleName.includes('/')) {
				throw new Error(
					`stylelint requires plugin rules to be namespaced, i.e. only "plugin-namespace/plugin-rule-name" plugin rule names are supported. The plugin rule "${rule_definition.ruleName}" does not do this.`
				)
			}
			plugin_functions[rule_definition.ruleName] = rule_definition.rule
		}
	}

	return plugin_functions
}

function prepare_config(config: Config): Promise<Config> {
	const prepared: Config = {
		rules: config.rules,
		defaultSeverity: config.defaultSeverity,
		_pluginFunctions: build_plugin_functions(config.plugins)
	}
	return normalizeAllRuleSettings(prepared)
}

async function lint_one(source: LintSource, config: Config) {
	try {
		const postcss_result = (await postcss().process(source.code, { from: source.id }).async()) as PostcssResult

		const wrapped: PostcssResult = Object.assign(postcss_result, {
			stylelint: {
				ruleSeverities: {},
				customMessages: {},
				customUrls: {},
				ruleMetadata: {},
				fixersData: {},
				rangesOfComputedEditInfos: [],
				disabledRanges: {},
				lexer: getLexer(config),
				referenceRoots: []
			}
		})

		await lintPostcssResult({ quietDeprecationWarnings: true }, wrapped, config)

		return createPartialStylelintResult(wrapped)
	} catch (error) {
		if (error instanceof Error && error.name === 'CssSyntaxError') {
			return createPartialStylelintResult(undefined, error as Error & { name: 'CssSyntaxError' })
		}
		throw error
	}
}

/**
 * Lint one or more in-memory CSS sources against a single config. No
 * `extends` resolution, no custom syntaxes, no caching, no ignore files, no
 * autofix - see the plan this implements for the full list of trade-offs.
 */
export async function lint(sources: LintSource[], config: Config): Promise<LinterResult> {
	const prepared_config = await prepare_config(config)
	const results = []

	for (const source of sources) {
		results.push(await lint_one(source, prepared_config))
	}

	return prepareReturnValue({ results, maxWarnings: undefined, formatter: jsonFormatter, cwd: '/' })
}
