import { Context } from '@netlify/edge-functions'

// Configuration
const CONFIG = {
	blockedCountries: ['CN', 'RU'], // ISO 3166-1 alpha-2 country codes
	minChromeVersion: 60
}

export default (request: Request, context: Context) => {
	const userAgent = request.headers.get('user-agent') || ''
	const countryCode = context.geo?.country?.code
	const countryName = context.geo?.country?.name || 'Unknown'
	const url = new URL(request.url).pathname

	// Parse Chrome version
	const chromeMatch = userAgent.match(/Chrome\/(\d+)/)
	const chromeVersion = chromeMatch ? parseInt(chromeMatch[1], 10) : undefined

	// Check if all blocking predicates match
	const matchesCountryPredicate = countryCode && CONFIG.blockedCountries.includes(countryCode)
	const matchesBrowserPredicate = chromeVersion && chromeVersion < CONFIG.minChromeVersion

	const shouldBlock = matchesCountryPredicate && matchesBrowserPredicate

	if (!shouldBlock) {
		// Pass through to SvelteKit
		return context.next()
	}

	// Log access control checks
	const log = {
		timestamp: new Date().toISOString(),
		url,
		userAgent,
		country: {
			code: countryCode,
			name: countryName
		},
		chrome: {
			version: chromeVersion,
			belowMinimum: chromeVersion && chromeVersion < CONFIG.minChromeVersion
		},
		predicates: {
			matchesCountry: matchesCountryPredicate,
			matchesBrowser: matchesBrowserPredicate
		},
		blocked: shouldBlock
	}

	console.log(JSON.stringify(log, undefined, 2))

	// Pass through to SvelteKit
	return context.next()
}
