import { getPostList } from '$lib/blog'

export function load() {
	return {
		posts: getPostList()
	}
}
