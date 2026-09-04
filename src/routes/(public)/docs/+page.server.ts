import { get_recipe_list } from './recipes/recipes.js'
import { group_by_section, get_metric_list } from './metrics/metrics.js'
import { getGroups } from '#lib/metric-groups.js'

export function load() {
	const metrics = get_metric_list()
	return {
		allRecipes: get_recipe_list(),
		groupedBySection: group_by_section(metrics),
		allGroups: getGroups()
	}
}
