import { get_recipe_list } from './recipes.js'

export function load() {
	const recipes = get_recipe_list()
	return { recipes }
}
