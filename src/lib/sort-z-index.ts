export const INVALID = Number.MAX_SAFE_INTEGER
export const MAX = INVALID - 1

export function normalize_z_index(value: string): number {
	if (/var\(|calc\(/i.test(value)) {
		return MAX
	}
	let parsed = Number(value)
	if (Number.isInteger(parsed)) {
		return parsed
	}
	return INVALID
}
