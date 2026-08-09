// pnpm's strict node_modules layout only installs packages declared
// directly in this repo's package.json - it doesn't hoist a dependency's
// own dependencies just because we deep-import files from inside that
// dependency.
//
// ./lint.ts deep-imports internals from `stylelint` itself (aliased to the
// real files on disk in vite.config.js, since they aren't part of
// stylelint's public `exports` map - see lint.ts's header comment). Those
// internals statically import a few packages that stylelint installs for
// its own use, but that our own code never references by name:
//
// - `css-tree` and `@csstools/css-syntax-patches-for-csstree`, used by
//   stylelint/lib/utils/getLexer.mjs, which lint.ts calls directly to
//   build the `.stylelint.lexer` scaffold field.
// - `@csstools/css-tokenizer`, used by stylelint/lib/assignDisabledRanges.mjs,
//   which lintPostcssResult.mjs calls unconditionally on every lint.
// - `fastest-levenshtein`, used by stylelint/lib/reportUnknownRuleNames.mjs,
//   statically imported by lintPostcssResult.mjs (only executes on an
//   unknown-rule-name error, but still needs to resolve at bundle time).
//
// Without them declared in package.json, pnpm won't install them at the top
// level and the browser bundle fails to resolve (see the "MISSING dep" notes
// in git history for the exact errors). This file's only job is to give
// dependency-usage tools (knip, depcheck, ...) - and future readers - a real,
// traceable usage site instead of a mysteriously "unused" dependency. Follow
// the imports above into node_modules/stylelint/lib to see the actual call
// sites; keep the versions here in sync with stylelint's own `dependencies`
// (node_modules/stylelint/package.json) when bumping the pinned stylelint
// version in package.json.
import { fork } from 'css-tree'
import syntaxPatches from '@csstools/css-syntax-patches-for-csstree' with { type: 'json' }
import { tokenize } from '@csstools/css-tokenizer'
import { distance } from 'fastest-levenshtein'

export const stylelint_transitive_deps = { fork, syntaxPatches, tokenize, distance }
