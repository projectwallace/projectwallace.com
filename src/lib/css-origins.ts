type CSSRawInputOrigin = {
	type: 'raw'
	css: string
}

type CSSLocalFileOrigin = {
	type: 'local-file'
	name: string
	css: string
}

type CSSFileOrigin = {
	type: 'file'
	href: string
	css: string
}

type CSSImportOrigin = {
	type: 'import'
	href: string
	css: string
}

type CSSLinkOrigin = {
	type: 'link'
	href: string
	url: string
	media?: string
	rel: string
	css: string
}

type CSSStyleTagOrigin = {
	type: 'style'
	css: string
	url: string
}

type CSSInlineOrigin = {
	type: 'inline'
	css: string
	url: string
}

export type CSSOrigin =
	| CSSImportOrigin
	| CSSLinkOrigin
	| CSSFileOrigin
	| CSSStyleTagOrigin
	| CSSInlineOrigin
	| CSSRawInputOrigin
	| CSSLocalFileOrigin
