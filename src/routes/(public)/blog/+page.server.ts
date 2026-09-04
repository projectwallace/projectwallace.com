import { get_post_list } from './posts.js'

export function load() {
	return {
		posts: get_post_list()
	}
}
