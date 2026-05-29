import { getGroups } from '$lib/metric-groups'
import { getRecipes } from '$lib/recipes'

export const prerender = true

export function load() {
	return {
		allGroups: getGroups(),
		allRecipes: getRecipes()
	}
}
