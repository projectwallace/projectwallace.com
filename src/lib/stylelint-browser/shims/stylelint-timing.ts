// Browser-only stand-in for stylelint's lib/timing.mjs. Vite redirects that
// relative import to this file for client bundles (see vite.config.js).
//
// The real module is only useful for `TIMING=<n> stylelint ...` CLI runs -
// our `node:process` shim never sets that env var, so `timing.enabled` would
// always be `false` anyway. Pulling in the real module drags in the `table`
// package, which (via `supports-hyperlinks` -> `supports-color`) doesn't
// bundle for the browser.
export default {
	display: () => {},
	enabled: false,
	getListSize: () => 0,
	tableConfig: {},
	time: (_key: string, fn: (...args: unknown[]) => unknown) => fn
}
