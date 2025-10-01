import { basename } from 'path'
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
	summary: string
	unit: string
	format: CodeQualityFormat
	category: string
	meta: Record<string, string>
}

type MdsvexDocument = {
	metadata: Record<string, string>
	default: {
		render: () => unknown
	}
}

export function getDocs() {
	let files = import.meta.glob('/content/docs/code-quality/*.md', { eager: true }) as Record<string, MdsvexDocument>
	let docs = Object.entries(files).map(
		([filePath, doc]) => {
			let id = basename(filePath, '.md')
				.split('-')
				.map((part: string) => capitalize(part))
				.join('')
			let MdsvexComponent = doc.default as unknown as Component
			let html = render(MdsvexComponent, { props: {} }).body
			let { title, summary, unit, format, category, ...meta } = doc.metadata

			return {
				id,
				title,
				html,
				summary,
				unit,
				format,
				category,
				meta
			} as CodeQualityDoc
		}
	)
	return docs.reduce((acc, curr) => {
		acc[curr.id] = curr
		return acc
	}, Object.create(null) as Record<string, CodeQualityDoc>)
}
