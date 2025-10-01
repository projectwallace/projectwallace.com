import { getPostList } from '$lib/blog'
import { getMetrics } from '$lib/metrics'
import { getRecipes } from '$lib/recipes'

export const prerender = true

const NOINDEX_PAGES: Set<string> = new Set([])

function getSystemPages() {
	let files = Object.keys(import.meta.glob([
		'../**/+page.svelte',
		'../**/+error.svelte',
		'../**/+layout.svelte',
	]))

	return files
		.map((route) => route
			.replace('../', '/')
			.replace('/+page.svelte', '')
			.replace('/+layout.svelte', '')
			.replace('/+error.svelte', '')
		)
		.filter((route) => {
			if (route.includes('[')) return false // urls with placeholders
			if (route.includes('/_')) return false // private routes, _error, or _layout
			return true
		})
}

export function GET() {
	let systemPages = getSystemPages()
	let posts = getPostList().map(post => post.path)
	let docs = getMetrics().concat(getRecipes()).map(p => p.path)

	let allUrls = [
		'/',
	].concat(systemPages, posts, docs)
		.filter(Boolean)
		.filter((path, index, array) => {
			return array.indexOf(path) === index
		})
		.filter((path) => !NOINDEX_PAGES.has(path))
	let body = allUrls.map((path) => 'https://www.projectwallace.com' + path).join(`\n`)

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain'
		}
	})
}
