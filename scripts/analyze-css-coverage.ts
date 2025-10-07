import * as fs from 'node:fs'
import * as path from 'node:path'
import { calculate_coverage } from '../src/lib/components/coverage/calculate-coverage.ts'
import { DOMParser } from 'linkedom'
import type { Coverage } from '../src/lib/components/coverage/types.ts'
import { parseArgs } from 'node:util'
import * as v from 'valibot'
import color from 'picocolors'

let args = process.argv.slice(2)

let { values } = parseArgs({
	args,
	allowPositionals: true,
	options: {
		minLineCoverage: {
			type: 'string'
		},
		showUncovered: {
			type: 'boolean',
			default: false
		}
	}
})

let valuesSchema = v.object({
	// Coerce args string to number and validate that it's between 0 and 1
	minLineCoverage: v.pipe(v.string(), v.transform(Number), v.number(), v.minValue(0), v.maxValue(1)),
	showUncovered: v.boolean()
})

let parse_result = v.safeParse(valuesSchema, values)
if (!parse_result.success) {
	console.error('Please specifiy a minLineCoverage option (--minLineCoverage=0.8) between 0 and 1')
	process.exit(1)
}

let minLineCoverage = parse_result.output.minLineCoverage

function parse_html(html: string) {
	return new DOMParser().parseFromString(html, 'text/html')
}

let files = fs.readdirSync('./css-coverage')
console.log(`Checking ${files.length} files...`)

let data = files.reduce((all_files, file_path) => {
	if (!file_path.endsWith('.json')) return all_files
	try {
		let content = fs.readFileSync(path.resolve('./css-coverage', file_path), 'utf-8')
		let parsed = JSON.parse(content) as Coverage[]
		all_files.push(...parsed)
		return all_files
	} catch {
		return all_files
	}
}, [] as Coverage[])

let result = calculate_coverage(data, parse_html)

console.log(`Analyzed ${result.files_found} coverage entries`)

if (result.line_coverage >= minLineCoverage) {
	console.log(`Success: line coverage is ${result.line_coverage.toFixed(2)}`)
} else {
	console.error(
		`Failed: line coverage is ${result.line_coverage.toFixed(2)} which is lower than the threshold of ${minLineCoverage}`
	)
	process.exit(1)
}

if (parse_result.output.showUncovered) {
	const NUM_LEADING_LINES = 3
	const NUM_TRAILING_LINES = NUM_LEADING_LINES
	for (let sheet of result.coverage_per_stylesheet) {
		if (sheet.coverage_ratio !== 1) {
			console.log()
			console.log(color.dim('─'.repeat(process.stdout.columns)))
			console.log(`${sheet.url}`)
			console.log(
				`Coverage: ${sheet.coverage_ratio.toFixed(2)}%, ${sheet.covered_lines} of ${sheet.total_lines} lines covered`
			)
			console.log(color.dim('─'.repeat(process.stdout.columns)))

			let lines = sheet.text.split('\n')
			let line_coverage = sheet.line_coverage
			let line_number = (num: number) => `${num.toString().padStart(5, ' ')} │ `

			for (let i = 0; i < lines.length; i++) {
				if (line_coverage[i] === 0) {
					// Rewind cursor N lines
					for (let j = i - NUM_LEADING_LINES; j < i; j++) {
						console.log(color.dim(line_number(j)), color.dim(lines[j]))
					}
					while (line_coverage[i] === 0) {
						console.log(color.red(line_number(i)), lines[i])
						i++
					}
					for (let end = i + NUM_TRAILING_LINES; i < end && i < lines.length; i++) {
						console.log(color.dim(line_number(i)), color.dim(lines[i]))
					}
					console.log()
				}
			}
		}
	}
}
// TODO: show uncovered blocks of code
// Muhahaha, that's huge to render and review, good luck with that
// like this:
//
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// url: https://projectwallacecom-17odovju6-project-wallace.vercel.app/_app/immutable/assets/Icon.H5P8WqwA.css
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────
//
// ```css
// 210 | ...
// 211 |   color: red;
// 212 | }
// 213 |
// 214 | h1 {
// 215 |   color: green;
// 216 | }
// 217 |
// 218 | ...
// ```
