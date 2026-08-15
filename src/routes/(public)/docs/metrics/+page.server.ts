import { groupBySection, getMetrics } from '#lib/metrics.js'
import { getGroups } from '#lib/metric-groups.js'

export function load() {
	const metrics = getMetrics()

	return {
		groupedBySection: groupBySection(metrics),
		allGroups: getGroups()
	}
}
