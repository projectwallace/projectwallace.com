import { render_md, require_frontmatter, to_slug, type MdsvexDocument } from '#lib/content.ts'

export type RecipeMeta = {
	slug: string
	path: string
	title: string
}

export type Recipe = RecipeMeta & { html: string }

type RecipeDocument = MdsvexDocument<{ title?: string }>

function load_modules() {
	return import.meta.glob('/content/docs/recipes/*.md', { eager: true }) as Record<string, RecipeDocument>
}

function to_meta(filePath: string, mod: RecipeDocument): RecipeMeta {
	let slug = to_slug(filePath)
	require_frontmatter('Recipe', filePath, mod.metadata, ['title'])

	return { slug, path: `/docs/recipes/${slug}`, title: mod.metadata.title }
}

export function get_recipe_list(): RecipeMeta[] {
	let files = load_modules()
	return Object.entries(files).map(([filePath, mod]) => to_meta(filePath, mod))
}

export function get_recipe(slug: string): Recipe | undefined {
	let files = load_modules()
	let entry = Object.entries(files).find(([filePath]) => to_slug(filePath) === slug)

	if (!entry) {
		return undefined
	}

	let [filePath, mod] = entry
	let meta = to_meta(filePath, mod)
	return { ...meta, html: render_md(mod) }
}
