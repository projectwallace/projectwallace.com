import { basename } from 'node:path'
import { render } from 'svelte/server'
import type { Component } from 'svelte'

export type RecipeMeta = {
	slug: string
	path: string
	title: string
}

export type Recipe = RecipeMeta & { html: string }

type MdsvexDocument = {
	metadata: { title?: string }
	default: {
		render: () => unknown
	}
}

function load_modules() {
	return import.meta.glob('/content/docs/recipes/*.md', { eager: true }) as Record<string, MdsvexDocument>
}

function to_meta(filePath: string, mod: MdsvexDocument): RecipeMeta {
	let slug = basename(filePath, '.md').toLowerCase().replaceAll('.', '-')
	let { title } = mod.metadata

	if (!title) {
		throw new Error(`Recipe at ${filePath} is missing required frontmatter (title)`)
	}

	return { slug, path: `/docs/recipes/${slug}`, title }
}

export function get_recipe_list(): RecipeMeta[] {
	let files = load_modules()
	return Object.entries(files).map(([filePath, mod]) => to_meta(filePath, mod))
}

export function get_recipe(slug: string): Recipe | undefined {
	let files = load_modules()
	let entry = Object.entries(files).find(
		([filePath]) => basename(filePath, '.md').toLowerCase().replaceAll('.', '-') === slug
	)

	if (!entry) return undefined

	let [filePath, mod] = entry
	let meta = to_meta(filePath, mod)
	let MdsvexComponent = mod.default as unknown as Component
	let html = render(MdsvexComponent, { props: {} }).body

	return { ...meta, html }
}
