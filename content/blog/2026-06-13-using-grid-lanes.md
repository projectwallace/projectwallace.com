---
title: Progressively enhanced data-dense layout with grid-lanes
excerpt: Masonry and grid-lanes aren't just for creative, editorial layouts. A few lines of CSS helped make our CSS analysis page a lot more data-dense.
---

<script>
	import BlogImage from '$components/BlogImage.svelte'
	import grid_before from '$lib/img/blog/2026-06-13-using-grid-lanes/before-grid.png?enhanced'
	import grid_before_full from '$lib/img/blog/2026-06-13-using-grid-lanes/before-grid.png'
	import grid_after from '$lib/img/blog/2026-06-13-using-grid-lanes/after-grid-lanes.png?enhanced'
	import grid_after_full from '$lib/img/blog/2026-06-13-using-grid-lanes/after-grid-lanes.png'
</script>

CSS Day 2026 was again full of excellent talks and [Patrick Brosset](https://patrickbrosset.com/)'s talk about `grid-lanes` was no exception. He gave plenty of examples of how grid-lanes can enhance a layout to be more playful/newspaper-like, but I was missing one very practical use case: fitting more information in dynamic information-dense interfaces!

Our [CSS analyzer page](/analyze-css) gives you dozens of metrics about your CSS, so that page tends to take up a lot of vertical space. Optimizing that space is really hard, because it is impossible to predict how many accessibility selectors, prefixed keyframes or browserhack selectors a website has before showing the analysis report. Many analyzed websites ended up showing _lots_ of empty space when viewing their reports:

<figure>
	<a href={grid_before_full}>
		<BlogImage src={grid_before} alt="Project Wallace CSS analysis page. It shows 8 panels with data like tables and headings across two grid rows. Each panel has a different height. The first row has one column that is significantly shorter than the others, causing a big gap of unused space." />
	</a>
	<figcaption>Whitespace becomes prominent if one of your metrics differs from the others.</figcaption>
</figure>

And then, in December 2025, CSS-Tricks published ["Masonry Layout is Now grid-lanes"](https://css-tricks.com/masonry-layout-is-now-grid-lanes/) with a small bullet point at the end of the article noting that a legacy implementation had been in Firefox for at least five years. Wait, that means I can use grid-lanes as progressive enhancement to make my grid take up less space? Let's give that a shot! Here is what I [ended up writing](https://github.com/projectwallace/projectwallace.com/commit/a8f913fc1f612c69d9002bbd6228c5c144c9c490#diff-392c4cf19c005eedb6e968dfb51cd3538023681b7062b015bdb01e7a0ecb31b6) by the end of February this year:

```css
.report-section {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(24rem, 1fr));

	/* Use legacy masonry rows if grid-lanes is explicitly not supported */
	@supports (grid-template-rows: masonry) and (not (display: grid-lanes)) {
		grid-template-rows: masonry;
	}

	/* Use grid-lanes when supported */
	@supports (display: grid-lanes) {
		display: grid-lanes;
	}
}
```

A small breakdown:

1. This uses `@supports` at-rules to feature detect either of the syntaxes;
1. Enable legacy `masonry` syntax with `grid-template-rows: masonry`;
1. Enable modern `grid-lanes` by overriding the existing `display: grid` with `display: grid-lanes`;
1. Browsers that support neither of those will display the 'before' grid-like structure.

The chances of it are very small, but just in case Firefox would support both `masonry` _and_ `grid-lanes` at the same time I added the negation case in the supports at-rule. My goal here is to use grid-lanes whenever possible and only use masonry if that's the only supported feature.

The resulting webpage is now a lot more dense, fitting more metrics in the viewport:

<figure>
	<a href={grid_after_full}>
		<BlogImage src={grid_after} alt="Project Wallace CSS analysis page. It shows 10 panels with data like tables and headings. Each panel has a different height and all panels are packed densely together, leading to a staggered edge at the bottom of the end of the list of panels." loading="lazy" />
	</a>
	<figcaption>Now 10 panels fit into the viewport instead of the initial 8 and less space is wasted on emptiness.</figcaption>
</figure>
