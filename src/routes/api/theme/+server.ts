import { type Theme, theme_schema } from '$lib/theme'
import * as v from 'valibot'

export async function POST({ request, locals, cookies }) {
	let request_theme = await request.text()
	let parsed_theme = v.safeParse(theme_schema, request_theme)
	let theme: Theme = 'system'

	if (parsed_theme.success) {
		theme = parsed_theme.output
		locals.theme = theme

		cookies.set('theme', theme, {
			path: '/',
			expires: new Date(Date.now() + 60 * 60 * 24 * 365 * 1000) // One year from now
		})

		return new Response('OK', {
			status: 200,
		})
	}

	return new Response('Invalid theme', { status: 400 })
}
