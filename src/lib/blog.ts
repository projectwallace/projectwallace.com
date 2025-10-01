import { basename } from 'node:path'
import { render } from 'svelte/server'
import type { Component } from 'svelte'

export type Post = {
	slug: string
	path: string
	title: string
	date: Date
	html: string
	excerpt: string;
}

type MdsvexDocument = {
	metadata: Record<string, string>
	default: {
		render: () => unknown
	}
}

export function getPost(slug: string) {
	let posts = getPostList()
	return posts.find((post) => post.slug === slug)
}

export function getPostList() {
	let files = import.meta.glob('/content/blog/*.md', { eager: true }) as Record<string, MdsvexDocument>

	return (
		Object.entries(files).map(([filePath, post]) => {
			let { metadata } = post
			let fileName = basename(filePath, '.md')
			let slug = fileName.slice('yyyy-mm-dd-'.length)
			let path = `/blog/${slug}`
			let date = new Date(fileName.slice(0, 'yyyy-mm-dd'.length))
			let MdsvexComponent = post.default as unknown as Component
			let html = render(MdsvexComponent, { props: {} }).body
			return { ...metadata, path, date, slug, html } as Post
		})
			// @ts-expect-error Plz, comparing dates like this is legal
			.sort((a, b) => b.date - a.date)
	)
}
