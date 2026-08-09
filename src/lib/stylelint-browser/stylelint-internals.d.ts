// stylelint's package.json `exports` map only publishes `.`, `./package.json`
// and `./lib/utils/*`. The files below are unpublished internals we deep-
// import on purpose (see src/lib/stylelint-browser/lint.ts) and alias in
// vite.config.js so the bundler can still find them on disk. TypeScript's
// "bundler" module resolution honours the exports map though, so without
// these ambient declarations it can't see the deep paths exist.
//
// Pinned to stylelint ~17.13.0 (see package.json) - re-check these shapes
// against node_modules/stylelint/lib/*.mjs whenever that version changes.

declare module 'stylelint/lib/lintPostcssResult.mjs' {
	import type { LinterOptions, PostcssResult, Config } from 'stylelint'
	export default function lintPostcssResult(
		stylelintOptions: Partial<LinterOptions>,
		postcssResult: PostcssResult,
		config: Config
	): Promise<unknown>
}

declare module 'stylelint/lib/normalizeAllRuleSettings.mjs' {
	import type { Config } from 'stylelint'
	export default function normalizeAllRuleSettings(config: Config): Promise<Config>
}

declare module 'stylelint/lib/createPartialStylelintResult.mjs' {
	import type { LintResult, PostcssResult } from 'stylelint'
	export default function createPartialStylelintResult(
		postcssResult?: PostcssResult,
		cssSyntaxError?: Error & { name: 'CssSyntaxError' }
	): LintResult
}

declare module 'stylelint/lib/prepareReturnValue.mjs' {
	import type { LinterResult, LintResult, Formatter } from 'stylelint'
	export default function prepareReturnValue(args: {
		results: LintResult[]
		maxWarnings?: number
		formatter: Formatter
		cwd: string
	}): LinterResult
}

declare module 'stylelint/lib/formatters/jsonFormatter.mjs' {
	import type { Formatter } from 'stylelint'
	const jsonFormatter: Formatter
	export default jsonFormatter
}

// stylelint's `./lib/utils/*` export is public, but since stylelint ships a
// "types" condition for its main entry, TypeScript treats the whole package
// as self-typed and stops falling back to `allowJs` inference for subpaths
// that lack their own declaration file - these four need the same manual
// pinning as the internals above.

declare module 'stylelint/lib/utils/getLexer.mjs' {
	import type { Config } from 'stylelint'
	export default function getLexer(config: Config, additionalSyntax?: unknown): unknown
}

declare module 'stylelint/lib/utils/report.mjs' {
	import type { Problem } from 'stylelint'
	export default function report(problem: Problem): void
}

declare module 'stylelint/lib/utils/ruleMessages.mjs' {
	export default function ruleMessages<T extends Record<string, unknown>>(ruleName: string, messages: T): T
}

declare module 'stylelint/lib/utils/validateOptions.mjs' {
	import type { PostcssResult } from 'stylelint'
	export default function validateOptions(
		result: PostcssResult,
		ruleName: string,
		...optionDescriptions: unknown[]
	): boolean
}

declare module 'stylelint/lib/utils/checkAgainstRule.mjs' {
	export default function checkAgainstRule(options: unknown, callback: (...args: unknown[]) => void): Promise<unknown>
}

// `css-tree` (a stylelint dependency, pinned in pinned-transitive-deps.ts)
// ships no types and has no `@types/css-tree` we've pulled in - only `fork`
// is referenced, so that's all that's declared here.
declare module 'css-tree' {
	export function fork(config: unknown): unknown
}
