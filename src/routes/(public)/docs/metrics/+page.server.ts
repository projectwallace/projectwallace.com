import { group_by_section, get_metric_list } from './metrics.js'
import { getGroups } from '#lib/metric-groups.js'

export function load() {
	const metrics = get_metric_list()

	return {
		groupedBySection: group_by_section(metrics),
		allGroups: getGroups()
	}
}
