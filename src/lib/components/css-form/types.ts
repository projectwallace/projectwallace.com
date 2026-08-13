import type { CSSOrigin } from '#lib/css-origins.js'

export type FormSuccessEvent = {
	origins: CSSOrigin[]
	prettify: boolean
	submit_type: 'raw' | 'url' | 'file'
}
