import { type Theme, validate_theme } from '#lib/theme.ts'

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365

/** POST <theme>: persist the chosen theme in a cookie that is readable by scripts */
export async function handle_theme(request: Request): Promise<Response> {
	let request_theme = await request.text()

	if (!validate_theme(request_theme)) {
		return new Response('Invalid theme', { status: 400 })
	}

	let theme: Theme = request_theme
	let cookie = [
		`theme=${theme}`,
		'Path=/',
		`Max-Age=${ONE_YEAR_IN_SECONDS}`,
		`Expires=${new Date(Date.now() + ONE_YEAR_IN_SECONDS * 1000).toUTCString()}`,
		'SameSite=Lax'
	]
	if (new URL(request.url).protocol === 'https:') {
		cookie.push('Secure')
	}

	return new Response('OK', { status: 200, headers: { 'Set-Cookie': cookie.join('; ') } })
}
