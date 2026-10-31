import { get_groups } from '#lib/metric-groups.ts'
import { get_recipe_list } from './recipes/recipes.ts'

export function load() {
	return {
		allGroups: get_groups(),
		allRecipes: get_recipe_list()
	}
}
