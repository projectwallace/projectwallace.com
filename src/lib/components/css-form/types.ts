import type { CSSOrigin } from '$lib/css-origins'

export type FormSuccessEvent = {
	origins: CSSOrigin[]
	prettify: boolean
	submit_type: 'raw' | 'url' | 'file'
}
