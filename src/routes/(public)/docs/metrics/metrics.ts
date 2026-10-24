import { basename } from 'node:path'
import { render } from 'svelte/server'
import type { Component } from 'svelte'

export type MetricMeta = {
	id: string
	slug: string
	path: string
	title: string
}

export type Metric = MetricMeta & {
	html: string
	meta: Record<string, string>
}

type MdsvexDocument = {
	metadata: { title?: string; [key: string]: string | undefined }
	default: {
		render: () => unknown
	}
}

function load_modules() {
	return import.meta.glob('/content/docs/metrics/*.md', { eager: true }) as Record<string, MdsvexDocument>
}

function to_id(filePath: string) {
	return basename(filePath, '.md')
}

function to_meta(filePath: string, mod: MdsvexDocument): MetricMeta {
	let id = to_id(filePath)
	let slug = id.toLowerCase().replaceAll('.', '-')
	let { title } = mod.metadata

	if (!title) {
		throw new Error(`Metric at ${filePath} is missing required frontmatter (title)`)
	}

	return { id, slug, path: `/docs/metrics/${slug}`, title }
}

export function get_metric_list(): MetricMeta[] {
	let files = load_modules()
	return Object.entries(files).map(([filePath, mod]) => to_meta(filePath, mod))
}

export function get_metric(slug: string): Metric | undefined {
	let files = load_modules()
	let entry = Object.entries(files).find(([filePath]) => to_id(filePath).toLowerCase().replaceAll('.', '-') === slug)

	if (!entry) return undefined

	let [filePath, mod] = entry
	let meta = to_meta(filePath, mod)
	let { title: _title, ...rest_meta } = mod.metadata
	let MdsvexComponent = mod.default as unknown as Component
	let html = render(MdsvexComponent, { props: {} }).body

	return { ...meta, html, meta: rest_meta as Record<string, string> }
}

export function group_by_section(metrics: MetricMeta[]) {
	return metrics.reduce(
		(groups, metric) => {
			let [group] = metric.id.split('.')

			if (!Array.isArray(groups[group])) {
				groups[group] = []
			}

			groups[group].push(metric)
			return groups
		},
		Object.create(null) as Record<string, MetricMeta[]>
	)
}
