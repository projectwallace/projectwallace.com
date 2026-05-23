import { graphql } from '$lib/github-client'
import { GH_TOKEN } from '$env/static/private'
import type { PageServerLoad } from './$types'

type ReadmeBlob = {
	repository: {
		readme: {
			text: string
		}
	}
}

export const load: PageServerLoad = async ({ fetch }) => {
	let { data } = await graphql<ReadmeBlob>(
		fetch,
		`
			query {
				repository(owner: "projectwallace", name: "stylelint-plugin") {
					readme: object(expression: "HEAD:README.md") {
						... on Blob {
							text
						}
					}
				}
			}
		`
	)

	let raw = data.repository.readme.text
	let breakIndex = raw.indexOf('<!-- BREAK -->')
	let markdown = breakIndex !== -1 ? raw.slice(breakIndex + '<!-- BREAK -->'.length) : raw

	let response = await fetch('https://api.github.com/markdown', {
		method: 'POST',
		headers: {
			authorization: `bearer ${GH_TOKEN}`,
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			text: markdown,
			mode: 'gfm',
			context: 'projectwallace/stylelint-plugin'
		})
	})

	let readme = await response.text()

	return { readme }
}
