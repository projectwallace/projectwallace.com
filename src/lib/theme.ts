import * as v from 'valibot'

export const theme_schema = v.union([v.literal('dark'), v.literal('light'), v.literal('system'), v.literal('naked')])

export type Theme = v.InferOutput<typeof theme_schema>
