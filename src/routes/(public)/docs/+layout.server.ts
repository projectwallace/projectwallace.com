import { getGroups } from '#lib/metric-groups.js'
import { get_recipe_list } from './recipes/recipes.js'

export function load() {
	return {
		allGroups: getGroups(),
		allRecipes: get_recipe_list()
	}
}
