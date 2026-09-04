import { error } from '@sveltejs/kit'
import { get_recipe } from '../recipes.js'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ params }) => {
	const page = get_recipe(params.slug)

	if (page === undefined) {
		error(404, 'Recipe not found')
	}

	return page
}
