import { GH_TOKEN } from '$env/static/private'

export async function graphql(fetch: typeof globalThis.fetch, query: string) {
	if (!GH_TOKEN) {
		throw new Error(`GH_TOKEN is not set`)
	}

	let response = await fetch(`https://api.github.com/graphql`, {
		method: 'POST',
		headers: {
			authorization: `bearer ${GH_TOKEN}`
		},
		body: JSON.stringify({
			query
		})
	})
	return response.json()
}