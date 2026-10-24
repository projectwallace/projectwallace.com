// Browser-only stand-in for Node's `node:process` module. Vite aliases the
// bare `node:process` specifier to this file for client bundles (see
// vite.config.js). Only the bits stylelint's internals touch are stubbed:
// - `env.TIMING` gates a CLI table printout we never trigger
// - `noDeprecation` toggles inclusion of deprecation messages
// - `emitWarning`/`on` are called defensively but never in normal operation
const process_shim = {
	env: {} as Record<string, string | undefined>,
	noDeprecation: false,
	emitWarning: (..._args: unknown[]) => {},
	on: (..._args: unknown[]) => {},
	hrtime: Object.assign((..._args: unknown[]) => [0, 0], { bigint: () => BigInt(0) })
}

export default process_shim
