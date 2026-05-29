import { error } from '@sveltejs/kit'
import { getMetrics } from '$lib/metrics'
import type { PageServerLoad } from './$types'

export const prerender = true

export function entries() {
	return getMetrics().map(({ slug }) => ({ slug }))
}

export const load: PageServerLoad = ({ params }) => {
	const page = getMetrics().find((doc) => params.slug === doc.slug)

	if (page === undefined) {
		error(404, 'Metric not found')
	}

	return page
}
