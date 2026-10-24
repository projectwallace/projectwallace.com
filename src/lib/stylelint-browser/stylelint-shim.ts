// Browser-only stand-in for the `stylelint` package itself. Vite aliases the
// bare `stylelint` specifier to this file for client bundles (see
// vite.config.js), so that plugin packages doing `import stylelint from
// 'stylelint'` (only to reach `stylelint.createPlugin`/`stylelint.utils`)
// don't drag in `standalone.mjs` and its Node-only deps (globby, cosmiconfig,
// write-file-atomic, ...).
//
// The four utils below live under stylelint's public `./lib/utils/*` export,
// so they resolve without any extra aliasing.
import report from 'stylelint/lib/utils/report.mjs'
import ruleMessages from 'stylelint/lib/utils/ruleMessages.mjs'
import validateOptions from 'stylelint/lib/utils/validateOptions.mjs'
import checkAgainstRule from 'stylelint/lib/utils/checkAgainstRule.mjs'
import type { Rule } from 'stylelint'

function createPlugin(ruleName: string, rule: Rule) {
	return { ruleName, rule }
}

export default {
	createPlugin,
	utils: { report, ruleMessages, validateOptions, checkAgainstRule }
}
