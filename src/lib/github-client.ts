import { GITHUB_TOKEN } from '$env/static/private'

export async function graphql(fetch: typeof globalThis.fetch, query: string) {
	if (!GITHUB_TOKEN) {
		throw new Error(`GITHUB_TOKEN is not set`)
	}

	let response = await fetch(`https://api.github.com/graphql`, {
		method: 'POST',
		headers: {
			authorization: `bearer ${GITHUB_TOKEN}`
		},
		body: JSON.stringify({
			query
		})
	})
	return response.json()
}