import { basename } from 'path'
import { render } from 'svelte/server'
import type { Component } from 'svelte'

type MetricGroup = {
	id: string
	slug: string
	path: string
	title: string
	html: string
	meta: Record<string, string>
}

export function getGroups() {
	let files = import.meta.glob('/content/docs/metric-groups/*.md', { eager: true }) as Record<string, { default: { render: () => unknown }, metadata: Record<string, string> }>
	return Object.entries(files).map(
		([filePath, doc]) => {
			let id = basename(filePath, '.md')
			let slug = id.toLowerCase().replaceAll('.', '-')
			let path = `/docs/metrics/${slug}`
			let MdsvexComponent = doc.default as unknown as Component
			let html = render(MdsvexComponent, { props: {} }).body
			let { title, ...meta } = doc.metadata

			return {
				html, slug, path, title, meta, id,
			} as MetricGroup
		}
	).sort((a, b) => parseInt(a.meta.order, 10) - parseInt(b.meta.order, 10))
}
