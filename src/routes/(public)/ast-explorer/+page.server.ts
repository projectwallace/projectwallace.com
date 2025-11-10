export async function load() {
	let pkg = await import('css-tree/package.json', { with: { type: 'json' } })
	return {
		css_tree_version: pkg.version
	}
}
