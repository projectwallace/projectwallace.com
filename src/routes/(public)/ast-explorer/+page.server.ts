import { read } from '$app/server'

export async function load() {
	let pkg = await read('/node_modules/@projectwallace/css-parser/package.json').json()
	return {
		parser_version: pkg.version,
		parser_homepage: pkg.homepage,
		parser_name: pkg.name
	}
}
