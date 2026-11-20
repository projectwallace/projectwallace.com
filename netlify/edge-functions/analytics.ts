// Netlify adapter: all logic lives in the platform-agnostic server/analytics.ts
import handler from '../../server/analytics.ts'

export default handler

export const config = {
	path: '/*',
	excludedPath: ['/_app/*', '/api/*']
}
