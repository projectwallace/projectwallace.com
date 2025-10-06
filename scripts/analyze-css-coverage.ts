import * as fs from 'node:fs'
import * as path from 'node:path'
import { calculate_coverage } from '../src/lib/components/coverage/calculate-coverage.ts'
import { DOMParser } from 'linkedom'
import type { Coverage } from '../src/lib/components/coverage/types.ts'
import { parseArgs } from 'node:util'

let args = process.argv.slice(2)

let { values } = parseArgs({
	args,
	allowPositionals: true,
	options: {
		minLineCoverage: {
			type: 'string'
		}
	}
})

if (!values.minLineCoverage) {
	console.error('Please specifiy a minLineCoverage option (--minLineCoverage=0.8)')
	process.exit(1)
}

let minLineCoverage = Number(values.minLineCoverage)

if (Number.isNaN(minLineCoverage) || minLineCoverage <= 0 || minLineCoverage > 1) {
	console.error('Please specify a valid number between 0 and 1 for --minLineCoverage')
	process.exit(1)
}

function parse_html(html: string) {
	return new DOMParser().parseFromString(html, 'text/html')
}

let files = fs.readdirSync('./css-coverage')
console.log(`🔎 Checking ${files.length} files...`)

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

console.log(`✨ Analyzed ${result.files_found} coverage entries`)

if (result.line_coverage < minLineCoverage) {
	console.error(
		`☠️ Line coverage is ${result.line_coverage.toFixed(2)} which is lower than the threshold of ${minLineCoverage}`
	)
	process.exit(1)
} else {
	console.log(`🎉 Line coverage is ${result.line_coverage.toFixed(2)}!`)
}
