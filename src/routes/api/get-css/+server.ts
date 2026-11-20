export const prerender = false

import { handle_get_css } from '#server/api/get-css.ts'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = ({ request }) => handle_get_css(request)
