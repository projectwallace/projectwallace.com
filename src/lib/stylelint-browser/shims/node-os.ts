// Browser-only stand-in for Node's `node:os` module. Vite aliases the bare
// `node:os` specifier to this file for client bundles (see vite.config.js).
// Stylelint's internals only ever read `EOL`.
export const EOL = '\n'
