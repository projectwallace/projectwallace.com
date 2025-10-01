import { error, json } from '@sveltejs/kit'
import { get_css } from './get-css'

export async function GET({ setHeaders, url }) {
	let analyzeUrl = url.searchParams.get('url')

	if (!analyzeUrl) {
		return json({ error: 'Missing URL' })
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
		error(500, 'An unexpected error occurred.');
	}
}
