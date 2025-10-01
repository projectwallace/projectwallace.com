<script lang="ts">
	interface Props {
		date: Date
	}

	let { date }: Props = $props()
</script>

<time datetime={date.toISOString()}>
	{new Intl.DateTimeFormat('en-GB', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}).format(date)}
</time>

<style>
	time {
		text-transform: uppercase;
		font-weight: var(--font-bold);
	}
</style>
