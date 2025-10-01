---
title: June 2025 release notes
excerpt: "'Only' 20 releases on the website this month but also lots of releases outside in our open source projects."
---

<script>
	import counterscale from '$lib/img/blog/2025-06-30-june-2025-release-notes/counterscale.png?enhanced'
  import counterscale_full from '$lib/img/blog/2025-06-30-june-2025-release-notes/counterscale.png'
	import resets from '$lib/img/blog/2025-06-30-june-2025-release-notes/resets.png?enhanced'
  import resets_full from '$lib/img/blog/2025-06-30-june-2025-release-notes/resets.png'
	import nesting from '$lib/img/blog/2025-06-30-june-2025-release-notes/nesting.png?enhanced'
  import nesting_full from '$lib/img/blog/2025-06-30-june-2025-release-notes/nesting.png'
	import atrules from '$lib/img/blog/2025-06-30-june-2025-release-notes/atrules.png?enhanced'
  import atrules_full from '$lib/img/blog/2025-06-30-june-2025-release-notes/atrules.png'
	import complexity from '$lib/img/blog/2025-06-30-june-2025-release-notes/complexity.png?enhanced'
  import complexity_full from '$lib/img/blog/2025-06-30-june-2025-release-notes/complexity.png'
</script>

'Only' 20 releases on the website this month but also lots of releases outside in our open source projects. Strap yourself in for a big list!

## New features

### Analyze spacing resets.

Sparked by Ana Rodrigues' talk on CSS Day which showed that she used Project Wallace (yay!) and [CSSStats](https://cssstats.com/) for auditing purposes. Turns out CSSStats does CSS resets analysis which we didn't offer before. Now we do (since [@projectwallace/css-analyzer@7.2.0](https://github.com/projectwallace/css-analyzer/pull/467)) with some improvements over CSSStats' implementation:

- Also check for logical properties (`margin-inline`, `padding-block-start`, etc.)
- Account for zero values that have a unit (`0px`, `0.0vh`, etc.)
- Account for shorthand values that are all zero (`0 0 0 0`, `0px 0 0em 0.0px`)

<figure>
	<a href={resets_full}>
		<enhanced:img src={resets} alt="A table showing CSS spacing resets found on a page." loading="eager" />
	</a>
	<figcaption>Spacing resets can be considered a code smell sometimes.</figcaption>
</figure>

### Analyze nesting depth

Initially sparked by the [Web Almanac CSS chapter](https://almanac.httparchive.org/en/2022/css), this has been on my wish list for years and I finally got to it. It wasn't even that hard to be honest so I'm a little disappointed in myself for not implementing this sooner. [@projectwallace/css-analyzer@7.4.0](https://github.com/projectwallace/css-analyzer/pull/468) has all the details and the website now shows how deep you're willing to go with your CSS.

<figure>
	<a href={nesting_full}>
		<enhanced:img src={nesting} alt="A table showing CSS nesting depths found on a page." loading="lazy" />
	</a>
	<figcaption>Oh, Adam, you're different than the rest of us</figcaption>
</figure>

### Atrule composition

For a quick overview of what your atrule game looks like you can look at the new atrules composition chart. It shows an overview of which atrule was used how often. Neat way to get a quick view of the landscape before you dive deeper.

<figure>
	<a href={atrules_full}>
		<enhanced:img src={atrules} alt="A table showing CSS atrules found on a page." loading="lazy" />
	</a>
	<figcaption>Oh look, this looks like modern stuff. Look at how many <code>@property</code> and <code>@layer</code> atrules.</figcaption>
</figure>

### New CSS design tokens library

Our design tokens page has had a panel for design tokens for a long time but now the output is more compliant with the [Design Tokens specification](https://tr.designtokens.org/). The code to create these tokens moved to a new package [@projectwallace/css-design-tokens](https://github.com/projectwallace/css-design-tokens) and it also powers the [design tokens page](/design-tokens) it was extracted from.

### CSS Selector complexity calculator page

Because I *sometimes* wish I had it. Nothing more. The CSS analyzer page shows a graph and table of selector complexity. Because of that it makes sense to offer [a standalone tool](/selector-complexity) to test individual selectors quickly.

<a href={complexity_full}>
	<enhanced:img src={complexity} alt="The complexity calculator showing the complexity of a long selector" loading="lazy" />
</a>

## Updated features

- When Adam Argyle comes on stage at CSS Day you know you're up for some great takeaways. This year [Adam did a talk](https://nerdy.dev/cssday-2025) on scrollers and my first goal was to fix the ugly scrollbars that appear absolutely everywhere! I highly recommend you watch the talk when it appears on [CSS Day's YouTube channel](https://www.youtube.com/@WebConferencesAmsterdam). Until then you can check out the slides on Adam's website.
- Implemented additional error boundaries and error logging. [Sentry](https://sentry.io) kindly offers an [Open-Source Sponsorship Plan](https://sentry.io/for/open-source/) which allows me to do more fine grained error logging than  I could in the free plan. Thanks Sentry for sponsoring!
- We do a ton of syntax highlight across this website but the highlighting in docs and blog posts looked different from everything else. Well, no more!
- The [Prettify CSS page](/prettify-css) now also allows indenting with spaces. But tabs are still default.

## Bug fixes

- [A while ago (February 2025)](https://www.projectwallace.com/blog/february-2025-release-notes) we implemented persisted state when navigating from one tool to another: you no longer need to re-enter your URL and hit that button. The page would remember it for you. Great! Unless you were going to the [CSS Scraper](/get-css) page. It would forget. What an odd one. Well, that's fixed now. Going to get-css keeps the CSS you've scraped before.
- Syntax highlighting the CSS input field on the [AST Explorer](/ast-explorer) page would often fail miserably. Now it fails less often and a little less miserable.
- When searching for a [custom property](/custom-property-inspector) that contained an uppercase character you'd always be disappointed. Not just by how life treats you but also because Wallace was shit at comparing characters. I taught him a lesson and it's such a good boy at finding your properties now.

## Dependencies

- Updated [@bramus/specificity](https://github.com/bramus/specificity) to 2.4.2 to fix a crash that would sometimes occur when people write CSS like `:nth-child()` or `:has()` without any contents inside the parentheses. Happens to the best of us.

## Website analytics

- Visitors: 4.2K
- Page Views: 8.3K
- Top pages: [analyze-css](/analyze-css) (25%), [get-css](/get-css) (21.7%), [css-code-quality](/css-code-quality) (18%), [design-tokens](/design-tokens) (7%)

<a href={counterscale_full}>
	<enhanced:img src={counterscale} alt="Dashboard overview of Counterscale website analytics for this website over the month June of 2025" loading="lazy" />
</a>

---

Every time I think the monthly update is going to take a little while to put together and every time I am amazed at how much work it is to slap together all these links, images and ramblings into a somewhat coherent post.
