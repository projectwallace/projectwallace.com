import { getGroups } from '#lib/metric-groups.ts'
import { get_recipe_list } from './recipes/recipes.ts'

export function load() {
	return {
		allGroups: getGroups(),
		allRecipes: get_recipe_list()
	}
}
