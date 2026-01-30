import GithubSlugger from 'github-slugger'

const svxModules = import.meta.glob('./*.{svx,md}', { query: '?raw', import: 'default', eager: true }) as Record<
	string,
	string
>

type NavItem = {
	id: string
	title: string
	items?: NavItem[]
}

export function load() {
	const slugger = new GithubSlugger()
	const nav: NavItem[] = []
	let currentH2: NavItem | null = null

	// Sort files to match the import order in +page.svelte
	const sortedFiles = Object.keys(svxModules).sort()

	for (const file of sortedFiles) {
		const content = svxModules[file]
		const headingRegex = /^(#{2,3})\s+(.+)$/gm
		let match

		while ((match = headingRegex.exec(content)) !== null) {
			const level = match[1].length
			const title = match[2].trim()
			const id = slugger.slug(title)

			if (level === 2) {
				currentH2 = { id, title, items: [] }
				nav.push(currentH2)
			} else if (level === 3 && currentH2) {
				currentH2.items!.push({ id, title })
			}
		}
	}

	return { nav }
}
