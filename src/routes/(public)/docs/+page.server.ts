import { getRecipes } from '#lib/recipes.js'
import { groupBySection, getMetrics } from '#lib/metrics.js'
import { getGroups } from '#lib/metric-groups.js'

export function load() {
	const metrics = getMetrics()
	return {
		allRecipes: getRecipes(),
		groupedBySection: groupBySection(metrics),
		allGroups: getGroups()
	}
}
