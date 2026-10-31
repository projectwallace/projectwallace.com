export type CodeQualityFormat = 'number' | 'size' | 'percentage'

/** A code quality metric with its rendered documentation */
export type CodeQualityDoc = {
	id: string
	title: string
	html: string
	unit?: string
	format: CodeQualityFormat
	category: string
	meta: Record<string, string>
}
