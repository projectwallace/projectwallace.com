import { test, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

/**
 * Everything in server/ must run on any runtime with the Fetch API (Workers, Deno, Bun, Netlify, Node).
 * Handlers take a Request and return a Response; platform code belongs in adapters outside this folder.
 */
const FORBIDDEN: [string, RegExp][] = [
	['framework import', /from\s+['"](\$app\/|\$env\/|\$lib|@sveltejs\/|svelte)/],
	['node: import', /from\s+['"]node:/],
	['process access', /\bprocess\./],
	['Buffer', /\bBuffer\b/],
	['Netlify global', /\bNetlify\b/]
]

// Stylelint needs Node (fs/path/cwd). It is isolated in this one handler, so it stays swappable.
const NODE_ONLY: Record<string, string[]> = {
	'api/lint-css.ts': ['process access']
}

function strip_comments(code: string): string {
	return code.replaceAll(/\/\*[\s\S]*?\*\//g, '').replaceAll(/(^|\s)\/\/.*$/gm, '$1')
}

function source_files(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		let path = join(dir, entry.name)
		if (entry.isDirectory()) {
			return source_files(path)
		}
		return path.endsWith('.ts') && !path.endsWith('.test.ts') ? [path] : []
	})
}

function find_violations(): string[] {
	return source_files(import.meta.dirname).flatMap((file) => {
		let name = relative(import.meta.dirname, file)
		let code = strip_comments(readFileSync(file, 'utf8'))
		let allowed = NODE_ONLY[name] ?? []
		return FORBIDDEN.filter(([label, pattern]) => pattern.test(code) && !allowed.includes(label)).map(
			([label]) => `${name}: ${label}`
		)
	})
}

test('server/ only uses web standards', () => {
	expect(find_violations()).toEqual([])
})
