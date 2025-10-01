import { error } from '@sveltejs/kit'
import { getMetrics } from '$lib/metrics'

export function load({ params }) {
	const page = getMetrics().find((doc) => params.slug === doc.slug)

	if (page === undefined) {
		error(404, 'Metric not found');
	}

	return page
}
