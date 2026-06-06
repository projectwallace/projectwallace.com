export const prerender = false

import { type Theme, validate_theme } from '$lib/theme'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, cookies }) => {
	let request_theme = await request.text()
	let theme: Theme = 'system'

	if (validate_theme(request_theme)) {
		theme = request_theme

		cookies.set('theme', theme, {
			path: '/',
			httpOnly: false,
			expires: new Date(Date.now() + 60 * 60 * 24 * 365 * 1000) // One year from now
		})

		return new Response('OK', {
			status: 200
		})
	}

	return new Response('Invalid theme', { status: 400 })
}
