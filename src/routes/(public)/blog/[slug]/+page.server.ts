import { error } from '@sveltejs/kit'
import { get_post, get_post_list } from '../posts.js'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ params }) => {
	let post = get_post(params.slug)

	if (post) {
		let posts = get_post_list()
		let popular = posts
			.filter(({ slug }) => ['css-complexity', 'making-analyze-css-render-6x-faster'].includes(slug))
			.map((post) => ({
				path: post.path,
				title: post.title,
				excerpt: post.excerpt,
				date: post.date
			}))
		return { post, popular }
	}

	error(404, 'Blog post not found')
}
