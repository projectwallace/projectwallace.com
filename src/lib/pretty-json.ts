export function pretty_json(
	obj: unknown,
	replacer?: (key: string, value: unknown) => unknown,
	space?: string | number
) {
	return (
		JSON.stringify(obj, replacer, space)
			// write all numbers on one line
			.replaceAll(/(\n\s+)(\d+)/g, '$2')
			// the closing line for the array is now on a new line, so move it back, but only for numeric arrays
			.replaceAll(/(\d)\s+\]/g, '$1]')
			// lasty, put nested arrays on one line
			.replaceAll(/(\n\s+)(\[)/g, '$2')
	)
}
