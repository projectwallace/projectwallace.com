export const prerender = false

import { handle_lint_css } from '#server/api/lint-css.ts'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = ({ request }) => handle_lint_css(request)
