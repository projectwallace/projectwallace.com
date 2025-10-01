import { getRecipes } from '$lib/recipes'
import { groupBySection, getMetrics } from '$lib/metrics'
import { getGroups } from '$lib/metric-groups'

export function load() {
	const metrics = getMetrics();
	return {
		allRecipes: getRecipes(),
		groupedBySection: groupBySection(metrics),
		allGroups: getGroups()
	}
}
