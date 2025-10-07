import * as v from 'valibot'
import type { Coverage } from './types'

let CoverageSchema = v.array(
	v.object({
		text: v.undefinedable(v.string()),
		url: v.string(),
		ranges: v.array(
			v.object({
				start: v.number(),
				end: v.number()
			})
		)
	})
)

export function parse_json(input: string) {
	try {
		let parse_result = JSON.parse(input)
		v.parse(CoverageSchema, parse_result)
		return parse_result as Coverage[]
	} catch {
		return [] as Coverage[]
	}
}
