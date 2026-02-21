<script lang="ts">
	interface Props {
		json: string
		class?: string
	}

	let { json, class: classname = '' }: Props = $props()
</script>

<pre class={['scroll-container', classname]} dir="ltr" translate="no"><code class="language-json">{json}</code></pre>

<style>
	pre {
		color: var(--fg-100);
	}
</style>
