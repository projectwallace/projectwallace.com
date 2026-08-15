export const prerender = false

import { error } from '@sveltejs/kit'
import { get_css } from './get-css'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ setHeaders, url }) => {
	let analyzeUrl = url.searchParams.get('url')

	if (analyzeUrl === null) {
		return Response.json({ error: 'Missing URL' }, { status: 400 })
	}

	try {
		let result = await get_css(analyzeUrl)

		if ('error' in result) {
			return Response.json({ error: result.error })
		}

		setHeaders({ 'Cache-Control': 's-maxage=600' })

		return Response.json(result)
	} catch (err) {
		console.error(err)
		error(500, 'An unexpected error occurred.')
	}
}
