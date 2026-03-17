import { error, json } from '@sveltejs/kit'
import { get_css } from './get-css'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ setHeaders, url }) => {
	let analyzeUrl = url.searchParams.get('url')

	if (analyzeUrl === null) {
		return json({ error: 'Missing URL' }, { status: 400 })
	}

	try {
		let result = await get_css(analyzeUrl)

		if ('error' in result) {
			return json({ error: result.error })
		}

		setHeaders({ 'Cache-Control': 's-maxage=600' })

		return json(result)
	} catch (err) {
		console.error(err)
		error(500, 'An unexpected error occurred.')
	}
}
