import { basename } from 'node:path'
import { render_md, require_frontmatter, type MdsvexDocument } from '#lib/content.ts'
import type { CodeQualityDoc, CodeQualityFormat } from '#lib/code-quality-doc.ts'

function capitalize(str: string) {
	return str.substring(0, 1).toUpperCase() + str.substring(1, str.length)
}

type CodeQualityDocument = MdsvexDocument<{
	title?: string
	unit?: string
	format?: CodeQualityFormat
	category?: string
	[key: string]: string | undefined
}>

export function get_docs(): Record<string, CodeQualityDoc> {
	let files = import.meta.glob('/content/docs/code-quality/*.md', { eager: true }) as Record<
		string,
		CodeQualityDocument
	>

	let docs = Object.entries(files).map(([filePath, doc]) => {
		let id = basename(filePath, '.md')
			.split('-')
			.map((part) => capitalize(part))
			.join('')
		require_frontmatter('Code quality doc', filePath, doc.metadata, ['title', 'format', 'category'])
		let { title, unit, format, category, ...meta } = doc.metadata

		return {
			id,
			title,
			html: render_md(doc),
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
