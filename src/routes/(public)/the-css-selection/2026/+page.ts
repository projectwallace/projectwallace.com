import { build_nav } from './nav.ts'

const svxModules = import.meta.glob('./*.{svx,md}', { query: '?raw', import: 'default', eager: true }) as Record<
	string,
	string
>

export function load() {
	// Sort files to match the import order in +page.svelte
	const sections = Object.keys(svxModules)
		.sort()
		.map((file) => svxModules[file])

	return { nav: build_nav(sections) }
}
