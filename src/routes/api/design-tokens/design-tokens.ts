import { parseHTML } from 'linkedom'
import { get_css, USER_AGENT } from '../get-css/get-css'
import { extract_design_tokens, group_suggestions } from './extract-tokens'
import type { Component } from './component-presets'

export async function get_design_tokens(url: string, component: Component = 'button') {
	let [html_response, css_origins] = await Promise.all([
		fetch(url, { headers: { 'User-Agent': USER_AGENT } }),
		get_css(url)
	])

	if ('error' in css_origins) {
		return css_origins
	}

	if (!html_response.ok) {
		return { error: { url, statusCode: html_response.status, message: html_response.statusText } }
	}

	let { document } = parseHTML(await html_response.text())
	let css = css_origins.map((origin) => origin.css).join('\n')
	let results = extract_design_tokens(document, css, component)

	return {
		component,
		elements: results.length,
		suggestions: group_suggestions(results)
	}
}
