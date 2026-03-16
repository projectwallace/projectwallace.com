<script>
	let { src, alt, loading = 'lazy', ...rest } = $props()
</script>

<enhanced:img {src} {alt} {loading} {...rest} />
