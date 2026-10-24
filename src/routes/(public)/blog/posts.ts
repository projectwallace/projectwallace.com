import { basename, dirname } from 'node:path'
import { render } from 'svelte/server'
import type { Component } from 'svelte'

export type PostMeta = {
	slug: string
	path: string
	title: string
	date: Date
	excerpt: string
	archived: boolean
}

export type Post = PostMeta & { html: string }

type MdsvexDocument = {
	metadata: {
		title?: string
		excerpt?: string
		date?: string
		archived?: string
	}
	default: {
		render: () => unknown
	}
}

function load_modules() {
	return import.meta.glob('/content/blog/*/index.md', { eager: true }) as Record<string, MdsvexDocument>
}

function to_meta(filePath: string, mod: MdsvexDocument): PostMeta {
	let slug = basename(dirname(filePath)).slice('yyyy-mm-dd-'.length)
	let { title, excerpt, date, archived } = mod.metadata

	if (!title || !excerpt || !date) {
		throw new Error(`Blog post at ${filePath} is missing required frontmatter (title, excerpt, date)`)
	}

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
	let entry = Object.entries(files).find(
		([filePath]) => basename(dirname(filePath)).slice('yyyy-mm-dd-'.length) === slug
	)

	if (!entry) return undefined

	let [filePath, mod] = entry
	let meta = to_meta(filePath, mod)

	if (meta.archived) return undefined

	let MdsvexComponent = mod.default as unknown as Component
	let html = render(MdsvexComponent, { props: {} }).body

	return { ...meta, html }
}

export function get_all_posts_with_html(): Post[] {
	let files = load_modules()

	return Object.entries(files)
		.map(([filePath, mod]) => {
			let meta = to_meta(filePath, mod)
			let MdsvexComponent = mod.default as unknown as Component
			let html = render(MdsvexComponent, { props: {} }).body
			return { ...meta, html }
		})
		.filter((post) => !post.archived)
		.sort((a, b) => b.date.getTime() - a.date.getTime())
}
