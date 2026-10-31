import { basename, dirname } from 'node:path'
import { render_md, require_frontmatter, type MdsvexDocument } from '#lib/content.ts'

export type PostMeta = {
	slug: string
	path: string
	title: string
	date: Date
	excerpt: string
	archived: boolean
}

export type Post = PostMeta & { html: string }

type PostDocument = MdsvexDocument<{
	title?: string
	excerpt?: string
	date?: string
	archived?: string
}>

function load_modules() {
	return import.meta.glob('/content/blog/*/index.md', { eager: true }) as Record<string, PostDocument>
}

function to_slug(filePath: string) {
	return basename(dirname(filePath)).slice('yyyy-mm-dd-'.length)
}

function to_meta(filePath: string, mod: PostDocument): PostMeta {
	let slug = to_slug(filePath)
	require_frontmatter('Blog post', filePath, mod.metadata, ['title', 'excerpt', 'date'])
	let { title, excerpt, date, archived } = mod.metadata

	return {
		slug,
		path: `/blog/${slug}`,
		title,
		excerpt,
		date: new Date(date),
		archived: archived === 'true'
	}
}

export function get_post_list(): PostMeta[] {
	let files = load_modules()

	return Object.entries(files)
		.map(([filePath, mod]) => to_meta(filePath, mod))
		.filter((post) => !post.archived)
		.sort((a, b) => b.date.getTime() - a.date.getTime())
}

export function get_post(slug: string): Post | undefined {
	let files = load_modules()
	let entry = Object.entries(files).find(([filePath]) => to_slug(filePath) === slug)

	if (!entry) return undefined

	let [filePath, mod] = entry
	let meta = to_meta(filePath, mod)

	if (meta.archived) return undefined

	return { ...meta, html: render_md(mod) }
}

export function get_all_posts_with_html(): Post[] {
	let files = load_modules()

	return Object.entries(files)
		.map(([filePath, mod]) => {
			return { ...to_meta(filePath, mod), html: render_md(mod) }
		})
		.filter((post) => !post.archived)
		.sort((a, b) => b.date.getTime() - a.date.getTime())
}
