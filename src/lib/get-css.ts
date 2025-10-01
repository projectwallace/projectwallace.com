import type { CSSOrigin } from './css-origins'

type ServerError = {
	message: string
	statusCode: number
}

export class CssFetchNetworkError extends Error { }

export class CssFetchApiError extends Error { }

export class CssFetchRemoteError extends Error { }

class UrlNotFoundError extends Error { }

export async function get_css(url: string | FormDataEntryValue): Promise<CSSOrigin[]> {
	let response: Response

	try {
		response = await fetch(`/api/get-css?url=${url}`, {
			headers: {
				Accept: 'application/json'
			}
		})
	} catch (error: unknown) {
		console.error('Network Error while fetching CSS from remote')
		throw new CssFetchNetworkError('Network Error while fetching CSS from remote')
	}

	if (!response.ok) {
		console.error('Get CSS API Error while fetching CSS: ' + response.statusText)
		throw new CssFetchApiError('Get CSS API Error while fetching CSS: ' + response.statusText)
	}

	let data: CSSOrigin[] | { error: ServerError } = await response.json()

	if ('error' in data) {
		let error = data.error

		if (error.statusCode === 404) {
			throw new UrlNotFoundError('URL not found. The server responded with HTTP 404. Is the URL publicly accessible?')
		}

		throw new CssFetchRemoteError(error.message)
	}

	return data
}
