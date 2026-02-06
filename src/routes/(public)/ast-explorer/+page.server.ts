import pkg from '@projectwallace/css-parser/package.json' with { type: 'json' }

export function load() {
	return {
		parser_version: pkg.version,
		parser_homepage: pkg.homepage,
		parser_name: pkg.name
	}
}
