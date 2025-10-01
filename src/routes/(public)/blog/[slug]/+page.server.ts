import { error } from '@sveltejs/kit'
import { getPost, getPostList } from '$lib/blog'

export function load({ params }) {
	let post = getPost(params.slug)

	if (post) {
		let posts = getPostList()
		let popular = posts.filter(({ slug }) => [
			'css-complexity',
			'making-analyze-css-render-6x-faster',
		].includes(slug))
			.map(post => ({
				path: post.path,
				title: post.title,
				excerpt: post.excerpt,
				date: post.date,
			}))
		return { post, popular }
	}

	error(404, 'Blog post not found');
}
