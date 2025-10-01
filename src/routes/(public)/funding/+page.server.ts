import { graphql } from '$lib/github-client.js'
import { render } from 'svelte/server'
import type { Component } from 'svelte'

type Provider = {
	title: string
	amount: number
	html: string
}

type MdsvexDocument = {
	metadata: Record<string, string>
	default: {
		render: () => {}
	}
}

type SponsorData = {
	data: {
		user: {
			sponsorsListing: {
				tiers: {
					nodes: {
						descriptionHTML: string
						name: string
						isOneTime: boolean
					}[]
				}
				activeGoal: {
					description: string
					percentComplete: number
					targetValue: number
					title: string
				}
			}
		}
	}
}

export async function load({ fetch }) {
	let response: SponsorData = await graphql(fetch, `query {
		user(login: "bartveneman") {
			sponsorsListing {
				tiers(first: 10) {
					nodes {
						descriptionHTML
						name
						isOneTime
					}
				}
				activeGoal {
					description
					percentComplete
					targetValue
					title
				}
			}
		}
	}`)

	let files = import.meta.glob('./*.md', { eager: true }) as Record<string, MdsvexDocument>
	let providers = Object.values(files)
		.map(provider => {
			let { default: markdown, metadata } = provider
			let MdsvexComponent = markdown as unknown as Component
			let html = render(MdsvexComponent, { props: {} }).body
			return ({
				html,
				title: metadata.title,
				amount: parseFloat(metadata.amount)
			}) as Provider
		})

	return {
		providers,
		tiers: response.data.user.sponsorsListing.tiers.nodes,
		sponsorGoal: {
			...response.data.user.sponsorsListing.activeGoal,
			title: '$21.50 per month',
			targetValue: 2150,
			percentComplete: 10 / 21.50 * 100
		},
	}
}