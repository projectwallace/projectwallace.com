import { basename } from 'path'
import { render } from 'svelte/server'
import type { Component } from 'svelte'

type RecipeDoc = {
	id: string
	slug: string
	path: string
	html: string
	title: string
	meta: Record<string, string>
}

type MdsvexDocument = {
	metadata: Record<string, string>
	default: {
		render: () => unknown
	}
}

export function getRecipes() {
	let files = import.meta.glob('/content/docs/recipes/*.md', { eager: true }) as Record<string, MdsvexDocument>
	return Object.entries(files).map(
		([filePath, doc]) => {
			let { default: component, metadata } = doc
			let id = basename(filePath, '.md')
			let slug = id.toLowerCase().replaceAll('.', '-')
			let path = `/docs/recipes/${slug}`
			let MdsvexComponent = component as unknown as Component
			let html = render(MdsvexComponent, { props: {} }).body
			let { title, ...meta } = metadata

			return {
				html, id, slug, path, title, meta
			} as RecipeDoc
		}
	)
}
