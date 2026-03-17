import { graphql } from '$lib/github-client'
import type { PageServerLoad } from './$types'

type Repo = {
	stargazerCount: number
	url: string
	description: string
	name: string
	nameWithOwner: string
}

export const load: PageServerLoad = async ({ fetch }) => {
	let { data } = await graphql<{
		analyzer: Repo
		cli: Repo
		colorsorter: Repo
		format: Repo
		constyble: Repo
		quality: Repo
	}>(
		fetch,
		`
			fragment Repo on Repository {
				stargazerCount
				url
				description
				name
				nameWithOwner
			}

			query {
				analyzer: repository(name: "css-analyzer", owner: "projectwallace") {
					...Repo
				}
				cli: repository(name: "wallace-cli", owner: "projectwallace") {
					...Repo
				}
				colorsorter: repository(name: "color-sorter", owner: "projectwallace") {
					...Repo
				}
				format: repository(name: "format-css", owner: "projectwallace") {
					...Repo
				}
				constyble: repository(name: "constyble", owner: "projectwallace") {
					...Repo
				}
				quality: repository(name: "css-code-quality", owner: "projectwallace") {
					...Repo
				}
			}
		`
	)
	let repositories = [data.analyzer, data.cli, data.colorsorter, data.format, data.constyble, data.quality]

	return {
		repositories,
		totalStars: repositories.reduce((acc, curr) => (acc += curr.stargazerCount), 0)
	}
}
