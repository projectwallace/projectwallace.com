export const prerender = false

import { handle_theme } from '#server/api/theme.ts'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = ({ request }) => handle_theme(request)
