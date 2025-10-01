import { pretty_json } from "./pretty-json"
import { test, expect, describe } from 'vitest'

test('array with integers', () => {
	let input = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
	let actual = pretty_json(input)
	let expected = `[0,1,2,3,4,5,6,7,8,9,10]`

	expect(actual).toEqual(expected)
})

test('array with floats', () => {
	let input = [0.0, 1.0, 2.0]
	let actual = pretty_json(input)
	let expected = `[0,1,2]`

	expect(actual).toEqual(expected)
})

test('simple plain object', () => {
	let input = {
		test: 1,
		more: 'hello',
		check: ['me', 'now'],
		case: {
			first: true
		}
	}

	expect(pretty_json(input, (key, value) => value, 2)).toEqual(`{
  "test": 1,
  "more": "hello",
  "check": [
    "me",
    "now"
  ],
  "case": {
    "first": true
  }
}`)
})

test('puts nested arrays on a single line', () => {
	let input = {
		"specificity": {
			"items": [
				[0, 2, 0],
				[0, 1, 0]
			]
		}
	}

	expect(pretty_json(input, (key, value) => value, 2)).toEqual(`{
  "specificity": {
    "items": [[0,2,0],[0,1,0]
    ]
  }
}`)
})