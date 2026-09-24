import { get_post_list } from './posts.ts'

export function load() {
	return {
		posts: get_post_list()
	}
}
