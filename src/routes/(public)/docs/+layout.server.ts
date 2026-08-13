import { getGroups } from '#lib/metric-groups.js'
import { getRecipes } from '#lib/recipes.js'

export function load() {
	return {
		allGroups: getGroups(),
		allRecipes: getRecipes()
	}
}
