import { basename } from 'node:path'
import { render } from 'svelte/server'
import type { Component } from 'svelte'

function capitalize(str: string) {
	return str.substring(0, 1).toUpperCase() + str.substring(1, str.length)
}

type CodeQualityFormat = 'number' | 'size' | 'percentage'

export type CodeQualityDoc = {
	id: string
	title: string
	html: string
	unit?: string
	format: CodeQualityFormat
	category: string
	meta: Record<string, string>
}

type MdsvexDocument = {
	metadata: {
		title?: string
		unit?: string
		format?: CodeQualityFormat
		category?: string
		[key: string]: string | undefined
	}
	default: {
		render: () => unknown
	}
}

export function get_docs(): Record<string, CodeQualityDoc> {
	let files = import.meta.glob('/content/docs/code-quality/*.md', { eager: true }) as Record<string, MdsvexDocument>

	let docs = Object.entries(files).map(([filePath, doc]) => {
		let id = basename(filePath, '.md')
			.split('-')
			.map((part) => capitalize(part))
			.join('')
		let { title, unit, format, category, ...meta } = doc.metadata

		if (!title || !format || !category) {
			throw new Error(`Code quality doc at ${filePath} is missing required frontmatter (title, format, category)`)
		}

		let MdsvexComponent = doc.default as unknown as Component
		let html = render(MdsvexComponent, { props: {} }).body

		return {
			id,
			title,
			html,
			unit,
			format,
			category,
			meta: meta as Record<string, string>
		} satisfies CodeQualityDoc
	})

	return docs.reduce(
		(acc, curr) => {
			acc[curr.id] = curr
			return acc
		},
		Object.create(null) as Record<string, CodeQualityDoc>
	)
}
