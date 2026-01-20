export async function load() {
	let pkg = await import('@projectwallace/css-parser/package.json', { with: { type: 'json' } })
	return {
		parser_version: pkg.version,
		parser_homepage: pkg.homepage,
		parser_name: pkg.name
	}
}
