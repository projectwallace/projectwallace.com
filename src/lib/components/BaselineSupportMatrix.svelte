<script lang="ts">
	import type { CssFeature } from '#lib/baseline/css-feature.js'
	import BaselineSupport from '#lib/components/BaselineSupport.svelte'

	let { feature }: { feature: CssFeature } = $props()
</script>

<BaselineSupport {feature} />
