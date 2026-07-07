import { chromium, type Browser } from 'playwright-core'
import { env } from '$env/dynamic/private'

export type RenderedPage = {
	html: string
	status: number
	statusText: string
	headers: Headers
}

// Reused across warm Netlify Function invocations to avoid re-negotiating a
// CDP connection with Browserless on every request.
let browser_promise: Promise<Browser> | undefined

async function get_browser(): Promise<Browser> {
	if (browser_promise !== undefined) {
		let browser = await browser_promise
		if (browser.isConnected()) {
			return browser
		}
		browser_promise = undefined
	}

	if (!env.BROWSERLESS_WS_ENDPOINT) {
		throw new Error('BROWSERLESS_WS_ENDPOINT is not configured')
	}

	browser_promise = chromium.connectOverCDP(env.BROWSERLESS_WS_ENDPOINT)
	return browser_promise
}

function normalize_navigation_error(error: unknown): Error {
	if (
		error instanceof Error &&
		/ERR_CONNECTION_REFUSED|ERR_NAME_NOT_RESOLVED|ERR_ADDRESS_UNREACHABLE/.test(error.message)
	) {
		return new Error('fetch failed')
	}
	return error instanceof Error ? error : new Error('something went wrong')
}

export async function render_with_browserless(
	url: string,
	{ timeout, userAgent }: { timeout: number; userAgent: string }
): Promise<RenderedPage> {
	let browser = await get_browser()
	let context = await browser.newContext({ userAgent })

	try {
		let page = await context.newPage()
		let response = await page.goto(url, { waitUntil: 'networkidle', timeout })

		if (response === null) {
			throw new Error('fetch failed')
		}

		let status = response.status()

		if (status === 403) {
			throw new Error('Forbidden')
		}

		if (status === 404) {
			throw new Error('Not Found')
		}

		let html = await page.content()
		let headers = new Headers(response.headers())

		return { html, status, statusText: response.statusText(), headers }
	} catch (error: unknown) {
		throw normalize_navigation_error(error)
	} finally {
		await context.close()
	}
}
