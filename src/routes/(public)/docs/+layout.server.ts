import { getGroups } from '$lib/metric-groups'
import { getRecipes } from '$lib/recipes'

export function load() {
	return {
		allGroups: getGroups(),
		allRecipes: getRecipes()
	}
}
