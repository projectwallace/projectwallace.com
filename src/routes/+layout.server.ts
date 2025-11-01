export const trailingSlash = 'never' // or 'always' or 'ignore', depending on what you want

import { dev } from '$app/environment'
import { env } from '$env/dynamic/private'

function should_allow_analytics({
	dev,
	deploy_context,
	user_agent
}: {
	dev: boolean
	deploy_context?: string
	user_agent: string | null
}): boolean {
	if (dev) return false

	if (deploy_context) {
		console.log('deploy context:', deploy_context)
	}

	if (user_agent) {
		user_agent = user_agent.toLowerCase()

		if (user_agent.includes('playwright')) return false
		if (user_agent.includes('sentry')) return false
		if (user_agent.includes('bot')) return false
		if (user_agent.includes('headless')) return false
	}

	return true
}

export function load({ locals, request }) {
	let allow_analytics = should_allow_analytics({
		dev,
		deploy_context: env.CONTEXT,
		user_agent: request.headers.get('user-agent')
	})

	return {
		theme: locals.theme,
		allow_analytics
	}
}
