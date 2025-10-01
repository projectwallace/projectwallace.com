import { error } from '@sveltejs/kit'
import { getRecipes } from '$lib/recipes'

export function load({ params }) {
	const page = getRecipes().find((p) => params.slug === p.slug)

	if (page === undefined) {
		error(404, 'Recipe not found');
	}

	return page
}
