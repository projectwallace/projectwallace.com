export const EMPTY = 0
export const DELETED = 1
export const ADDED = 2
const NUM_BLOCKS = 5

export function diffstat_blocks(additions: number, deletions: number) {
	// Uint8Array is filled with zeros (EMPTY) by default
	let result = new Uint8Array(NUM_BLOCKS)
	let total = additions + deletions

	// No changes, return all zeros
	if (total === 0) return result

	// Less than or equal to 5 changes, fill the array and return
	if (total <= NUM_BLOCKS) {
		let index = 0
		for (let i = 0; i < additions; i++) {
			result[index++] = ADDED
		}
		for (let i = 0; i < deletions; i++) {
			result[index++] = DELETED
		}
		return result
	}

	// Equal number of additions and deletions: fill the array with half and half
	// and leave the final block empty
	if (additions === deletions) {
		let half = (NUM_BLOCKS / 2) | 0
		for (let i = 0; i < half; i++) {
			result[i] = ADDED
			result[i + half] = DELETED
		}
		return result
	}

	// Calculate proportions with fast rounding
	let add_squares = ((additions / total) * NUM_BLOCKS + 0.5) | 0
	let del_squares = ((deletions / total) * NUM_BLOCKS + 0.5) | 0

	// Ensure exactly 5 squares (rounding may have added one)
	if (add_squares + del_squares > NUM_BLOCKS) {
		if (add_squares > del_squares) {
			add_squares--
		} else {
			del_squares--
		}
	}

	// Fill the array
	for (let i = 0; i < add_squares; i++) {
		result[i] = ADDED
	}
	for (let i = add_squares; i < add_squares + del_squares; i++) {
		result[i] = DELETED
	}

	return result
}