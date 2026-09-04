import { error } from '@sveltejs/kit'
import { get_metric } from '../metrics.js'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ params }) => {
	const page = get_metric(params.slug)

	if (page === undefined) {
		error(404, 'Metric not found')
	}

	return page
}
