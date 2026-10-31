import GithubSlugger from 'github-slugger'

export type NavItem = {
	id: string
	title: string
	items?: NavItem[]
}

// A fenced code block: an opening fence of 3+ backticks or tildes up to the closing fence of the same kind
const FENCED_CODE_BLOCK = /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[^\n]*$/gm

/** Build the table of contents (`##` headings with their `###` children) from the raw markdown of all sections, in order. */
export function build_nav(sections: string[]): NavItem[] {
	const slugger = new GithubSlugger()
	const nav: NavItem[] = []
	let current_h2: NavItem | undefined

	for (const section of sections) {
		// Headings inside fenced code blocks are examples, not headings of the page
		const content = section.replaceAll(FENCED_CODE_BLOCK, '')

		for (const match of content.matchAll(/^(#{2,3})\s+(.+)$/gm)) {
			const level = match[1].length
			const title = match[2].trim()
			const id = slugger.slug(title)

			if (level === 2) {
				current_h2 = { id, title, items: [] }
				nav.push(current_h2)
			} else if (current_h2) {
				current_h2.items?.push({ id, title })
			}
		}
	}

	return nav
}
