import { getRecipes } from '$lib/recipes'

export function load() {
	const recipes = getRecipes()
	return { recipes }
}
