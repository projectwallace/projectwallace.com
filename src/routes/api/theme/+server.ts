import { type Theme, validate_theme } from '$lib/theme'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
	let request_theme = await request.text()
	let theme: Theme = 'system'

	if (validate_theme(request_theme)) {
		theme = request_theme
		locals.theme = theme

		cookies.set('theme', theme, {
			path: '/',
			expires: new Date(Date.now() + 60 * 60 * 24 * 365 * 1000), // One year from now
		})

		return new Response('OK', {
			status: 200,
		})
	}

	return new Response('Invalid theme', { status: 400 })
}
