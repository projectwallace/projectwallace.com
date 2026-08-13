import { getPostList } from '#lib/blog.js'

export function load() {
	return {
		posts: getPostList()
	}
}
