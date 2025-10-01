import { basename } from 'path'
import { render } from 'svelte/server'
import type { Component } from 'svelte'

type MetricDoc = {
	html: string
	id: string
	slug: string
	path: string
	title: string
	meta: Record<string, string>
}

type MdsvexDocument = {
	metadata: Record<string, string>
	default: {
		render: () => unknown
	}
}

export function getMetrics() {
	let files = import.meta.glob('/content/docs/metrics/*.md', { eager: true }) as Record<string, MdsvexDocument>
	return Object.entries(files).map(
		([filePath, doc]) => {
			let { default: component, metadata } = doc
			let id = basename(filePath, '.md')
			let slug = id.toLowerCase().replaceAll('.', '-')
			let path = `/docs/metrics/${slug}`
			let MdsvexComponent = component as unknown as Component
			let html = render(MdsvexComponent, { props: {} }).body
			let { title, ...meta } = metadata

			return {
				html, id, slug, path, title, meta
			} as MetricDoc
		}
	)
}

export function groupBySection(metrics: MetricDoc[]) {
	return metrics.map((metric) => {
		let { html, meta, id, ...rest } = metric
		let [group] = id.split('.')
		return {
			...rest,
			group
		}
	})
		.reduce((groups, metric) => {
			if (!Array.isArray(groups[metric.group])) {
				groups[metric.group] = []
			}

			groups[metric.group].push(metric)
			return groups
		}, Object.create(null) as Record<string, Partial<MetricDoc>[]>)
}
