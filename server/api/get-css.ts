import { get_css } from '../get-css.ts'

/** GET ?url=<url>: scrape the CSS of a web page */
export async function handle_get_css(request: Request): Promise<Response> {
	let analyze_url = new URL(request.url).searchParams.get('url')

	if (analyze_url === null) {
		return Response.json({ error: 'Missing URL' }, { status: 400 })
	}

	try {
		let result = await get_css(analyze_url)

		if ('error' in result) {
			return Response.json({ error: result.error })
		}

		return Response.json(result, { headers: { 'Cache-Control': 's-maxage=600' } })
	} catch (error) {
		console.error(error)
		return Response.json({ message: 'An unexpected error occurred.' }, { status: 500 })
	}
}
