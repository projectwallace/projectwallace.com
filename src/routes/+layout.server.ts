// Can be 'never' because Vercel supports cleanUrls:
// https://vercel.com/docs/project-configuration#project-configuration/clean-urls
export const trailingSlash = 'never' // or 'always' or 'ignore', depending on what you want

import { dev } from '$app/environment'

function should_allow_analytics({
	dev,
	user_agent,
}: {
	dev: boolean
	user_agent: string | null
}): boolean {
	if (dev)
		return false

	if (user_agent) {
		user_agent = user_agent.toLowerCase()

		if (user_agent.includes('playwright'))
			return false

		if (user_agent.includes('sentry'))
			return false

		if (user_agent.includes('bot'))
			return false

		if (user_agent.includes('headless'))
			return false
	}

	return true
}

export function load({ locals, request }) {
	let allow_analytics = should_allow_analytics({
		dev,
		user_agent: request.headers.get('user-agent'),
	})

	return {
		theme: locals.theme,
		allow_analytics
	}
}
