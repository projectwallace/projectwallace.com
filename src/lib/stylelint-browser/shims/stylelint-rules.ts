// Browser-only stand-in for stylelint's lib/rules/index.mjs (aliased in
// place of it in vite.config.js).
//
// The real module resolves each built-in rule via a *dynamic* import whose
// path is only known at runtime: `import(\`./${ruleName}/index.mjs\`)`.
// Rollup can't statically enumerate that - the variable makes every
// possible target unknowable at build time - and because the real file
// lives inside node_modules, Vite's "dynamic import with a non-literal
// path" handling (which can glob-expand some such imports) skips it. Net
// result in a production build: no per-rule chunk ever gets emitted, and
// every lint request 404s trying to fetch one at runtime. This reproduces
// identically on stylelint 17.13.0, 17.16.0 and 18.0.0-next.0 - it's not
// tied to any one stylelint version, so bumping/pinning a version alone
// can't fix it.
//
// `import.meta.glob` is Vite's own answer to exactly this: given a literal
// glob pattern (known at build time), it generates one real, statically
// analyzable dynamic import per matched file, so Rollup emits (and
// correctly rewrites every request to) a real chunk for every rule - while
// still loading each one lazily, same as the code this replaces.
import type { Rule } from 'stylelint'

const rule_modules = import.meta.glob('../../../../node_modules/stylelint/lib/rules/*/index.mjs') as Record<
	string,
	() => Promise<{ default: Rule }>
>

const rules: Record<string, Promise<Rule>> = {}

for (const [path, load] of Object.entries(rule_modules)) {
	const match = /\/rules\/([^/]+)\/index\.mjs$/.exec(path)
	if (!match) {
		continue
	}
	// oxlint-disable-next-line prefer-top-level-await -- must stay deferred: awaiting here would load every rule eagerly, defeating the point of this file
	rules[match[1]] = load().then((module) => module.default)
}

export default rules
