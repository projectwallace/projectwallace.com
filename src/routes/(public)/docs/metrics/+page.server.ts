import { group_by_section, get_metric_list } from './metrics.ts'
import { getGroups } from '#lib/metric-groups.ts'

export function load() {
	const metrics = get_metric_list()

	return {
		groupedBySection: group_by_section(metrics),
		allGroups: getGroups()
	}
}
