export const prerender = false

import { error, json } from '@sveltejs/kit'
import { get_design_tokens } from './design-tokens'
import { COMPONENT_PRESETS, type Component } from './component-presets'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ setHeaders, url }) => {
	let analyzeUrl = url.searchParams.get('url')

	if (analyzeUrl === null) {
		return json({ error: 'Missing URL' }, { status: 400 })
	}

	let component = url.searchParams.get('component') ?? 'button'

	if (!(component in COMPONENT_PRESETS)) {
		return json({ error: `Unsupported component: ${component}` }, { status: 400 })
	}

	try {
		let result = await get_design_tokens(analyzeUrl, component as Component)

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
