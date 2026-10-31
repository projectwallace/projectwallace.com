import { basename } from 'node:path'
import { render_md, require_frontmatter, to_slug, type MdsvexDocument } from '#lib/content.ts'

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

type MetricDocument = MdsvexDocument<{ title?: string; [key: string]: string | undefined }>

function load_modules() {
	return import.meta.glob('/content/docs/metrics/*.md', { eager: true }) as Record<string, MetricDocument>
}

function to_meta(filePath: string, mod: MetricDocument): MetricMeta {
	let id = basename(filePath, '.md')
	let slug = to_slug(filePath)
	require_frontmatter('Metric', filePath, mod.metadata, ['title'])

	return { id, slug, path: `/docs/metrics/${slug}`, title: mod.metadata.title }
}

export function get_metric_list(): MetricMeta[] {
	let files = load_modules()
	return Object.entries(files).map(([filePath, mod]) => to_meta(filePath, mod))
}

export function get_metric(slug: string): Metric | undefined {
	let files = load_modules()
	let entry = Object.entries(files).find(([filePath]) => to_slug(filePath) === slug)

	if (!entry) {
		return undefined
	}

	let [filePath, mod] = entry
	let meta = to_meta(filePath, mod)
	let { title: _title, ...rest_meta } = mod.metadata

	return { ...meta, html: render_md(mod), meta: rest_meta as Record<string, string> }
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
