import { parseHTML } from 'linkedom'
import { get_css, USER_AGENT } from '../get-css/get-css'
import { extract_all_design_tokens } from './extract-tokens'
import { resolve_url } from '../../../lib/resolve-url.js'
import { extract_root_custom_properties } from '../../../lib/resolve-css-variables.js'

export async function get_design_tokens(url: string) {
	let resolved_url = resolve_url(url)

	if (resolved_url === undefined) {
		return {
			error: { url, statusCode: 400, message: 'The URL is not valid. Are you sure you entered a URL and not CSS?' }
		}
	}

	let [html_response, css_origins] = await Promise.all([
		fetch(resolved_url, { headers: { 'User-Agent': USER_AGENT } }).catch(() => undefined),
		get_css(url)
	])

	if ('error' in css_origins) {
		return css_origins
	}

	if (html_response === undefined || !html_response.ok) {
		return {
			error: {
				url,
				statusCode: html_response?.status ?? 502,
				message: html_response?.statusText ?? 'Could not fetch the page HTML to find components on.'
			}
		}
	}

	let { document } = parseHTML(await html_response.text())
	let css = css_origins.map((origin) => origin.css).join('\n')

	return {
		components: extract_all_design_tokens(document, css),
		root_custom_properties: Object.fromEntries(extract_root_custom_properties(css))
	}
}
