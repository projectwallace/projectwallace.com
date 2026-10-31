import { test, expect } from 'vitest'
import { with_css_params, without_css_params } from './css-url-params.ts'

test('sets url and prettify', () => {
	let result = with_css_params(new URL('https://example.com/analyze-css'), { url: 'https://a.test', prettify: true })
	expect(result.searchParams.get('url')).toBe('https://a.test')
	expect(result.searchParams.get('prettify')).toBe('1')
})

test('serializes prettify=false as 0', () => {
	expect(with_css_params(new URL('https://example.com/'), { prettify: false }).searchParams.get('prettify')).toBe('0')
})

test('leaves params that are not given untouched', () => {
	let result = with_css_params(new URL('https://example.com/?url=x&prettify=1&other=1'), { prettify: false })
	expect(result.searchParams.get('url')).toBe('x')
	expect(result.searchParams.get('other')).toBe('1')
	expect(result.searchParams.get('prettify')).toBe('0')
})

test('does not mutate a URL passed in', () => {
	let base = new URL('https://example.com/')
	with_css_params(base, { url: 'x' })
	expect(base.search).toBe('')
})

test('without_css_params removes url, prettify and hash only', () => {
	let result = without_css_params(new URL('https://example.com/p?url=x&prettify=1&other=1#frag'))
	expect(result.search).toBe('?other=1')
	expect(result.hash).toBe('')
})
