import * as fs from 'node:fs'
import * as path from 'node:path'
import { calculate_coverage } from '../src/lib/components/coverage/calculate-coverage.ts'
import { DOMParser } from 'linkedom'
import type { Coverage } from '../src/lib/components/coverage/types.ts'
import { parseArgs, styleText } from 'node:util'
import * as v from 'valibot'
import { parse_json } from '../src/lib/components/coverage/parse-coverage.ts'

let args = process.argv.slice(2)

let { values } = parseArgs({
	args,
	allowPositionals: true,
	options: {
		// TODO: allow glob?
		// TODO: convert to coveragedir, min-line-coverage, etc.
		coverageDir: {
			type: 'string'
		},
		minLineCoverage: {
			type: 'string'
		},
		minFileLineCoverage: {
			type: 'string',
			default: '0'
		},
		showUncovered: {
			type: 'string',
			default: 'none'
		}
	}
})

const showUncoveredOptions = {
	none: 'none',
	all: 'all',
	violations: 'violations'
} as const

let valuesSchema = v.object({
	coverageDir: v.pipe(v.string(), v.nonEmpty()),
	// Coerce args string to number and validate that it's between 0 and 1
	minLineCoverage: v.pipe(v.string(), v.transform(Number), v.number(), v.minValue(0), v.maxValue(1)),
	// Coerce args string to number and validate that it's between 0 and 1
	minFileLineCoverage: v.optional(v.pipe(v.string(), v.transform(Number), v.number(), v.minValue(0), v.maxValue(1))),
	showUncovered: v.optional(v.pipe(v.string(), v.enum(showUncoveredOptions)), 'none')
})

let parse_result = v.safeParse(valuesSchema, values)
if (!parse_result.success) {
	console.error(styleText(['red', 'bold'], 'Failure'), ': invalid arguments')
	for (let issue of parse_result.issues) {
		console.error(`- ${issue.path?.map((p) => p.key).join('.')}: ${issue.message}`)
	}
	process.exit(1)
}
let { coverageDir, minLineCoverage, minFileLineCoverage, showUncovered } = parse_result.output

function parse_html(html: string) {
	return new DOMParser().parseFromString(html, 'text/html')
}

let files = fs.readdirSync(coverageDir)

if (files.length === 0) {
	console.error(styleText(['red', 'bold'], 'Failure'), `: no JSON files found in ${coverageDir}`)
	process.exit(1)
}

console.log(`Checking ${files.length} files...`)

let data = files.reduce((all_files, file_path) => {
	if (!file_path.endsWith('.json')) return all_files
	try {
		let content = fs.readFileSync(path.resolve(coverageDir, file_path), 'utf-8')
		let parsed = parse_json(content)
		all_files.push(...parsed)
		return all_files
	} catch {
		return all_files
	}
}, [] as Coverage[])

let result = calculate_coverage(data, parse_html)

console.log(`Analyzed ${result.files_found} coverage entries`)

// Verify minLineCoverage
if (result.line_coverage_ratio >= minLineCoverage) {
	console.log(
		`${styleText(['bold', 'green'], 'Success')}: total line coverage is ${(result.line_coverage_ratio * 100).toFixed(2)}%`
	)
} else {
	console.error(
		`${styleText(['bold', 'red'], 'Failed')}: line coverage is ${(result.line_coverage_ratio * 100).toFixed(2)}% which is lower than the threshold of ${minLineCoverage}`
	)
	process.exitCode = 1
}

// Verify minFileLineCoverage
if (minFileLineCoverage !== undefined && minFileLineCoverage !== 0) {
	if (result.coverage_per_stylesheet.some((sheet) => sheet.line_coverage_ratio < minFileLineCoverage)) {
		console.error(
			`${styleText(['bold', 'red'], 'Failed')}: Not all files meet the minimum line coverage of ${minFileLineCoverage * 100}%:`
		)
		process.exitCode = 1
	} else {
		console.log(
			`${styleText(['bold', 'green'], 'Success')}: all files pass minFileLineCoverage of ${minFileLineCoverage * 100}%`
		)
	}
}

if (showUncovered !== 'none') {
	const NUM_LEADING_LINES = 3
	const NUM_TRAILING_LINES = NUM_LEADING_LINES
	let terminal_width = process.stdout.columns || 80
	let line_number = (num: number, covered: boolean = true) =>
		`${num.toString().padStart(5, ' ')} ${covered ? '│' : '☓'} `

	for (let sheet of result.coverage_per_stylesheet) {
		if (
			(sheet.line_coverage_ratio !== 1 && showUncovered === 'all') ||
			(minFileLineCoverage !== undefined &&
				minFileLineCoverage !== 0 &&
				sheet.line_coverage_ratio < minFileLineCoverage &&
				showUncovered === 'violations')
		) {
			console.log()
			console.log(styleText('dim', '─'.repeat(terminal_width)))
			console.log(sheet.url)
			console.log(
				`Coverage: ${(sheet.line_coverage_ratio * 100).toFixed(2)}%, ${sheet.covered_lines}/${sheet.total_lines} lines covered`
			)
			if (minFileLineCoverage) {
				let lines_to_cover = minFileLineCoverage * sheet.total_lines - sheet.covered_lines
				console.log(
					`💡 Cover ${Math.ceil(lines_to_cover)} more lines to meet the file threshold of ${minFileLineCoverage * 100}%`
				)
			}
			console.log(styleText('dim', '─'.repeat(terminal_width)))

			let lines = sheet.text.split('\n')
			let line_coverage = sheet.line_coverage

			for (let i = 0; i < lines.length; i++) {
				if (line_coverage[i] === 0) {
					// Rewind cursor N lines to render N previous lines
					for (let j = i - NUM_LEADING_LINES; j < i; j++) {
						console.log(styleText('dim', line_number(j)), styleText('dim', lines[j]))
					}
					// Render uncovered lines while increasing cursor until reaching next covered block
					while (line_coverage[i] === 0) {
						console.log(styleText('red', line_number(i, false)), lines[i])
						i++
					}
					// Forward cursor N lines to render N trailing lines
					for (let end = i + NUM_TRAILING_LINES; i < end && i < lines.length; i++) {
						console.log(styleText('dim', line_number(i)), styleText('dim', lines[i]))
					}
					// Show empty line between blocks
					console.log()
				}
			}
		}
	}
}
