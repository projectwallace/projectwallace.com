import { getRecipes } from '#lib/recipes.js'

export function load() {
	const recipes = getRecipes()
	return { recipes }
}
