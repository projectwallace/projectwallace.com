---
title: CSS Day 2023 takeaways
excerpt: CSS Day 2023 was once again an amazing conference! So many new things coming to means that we need to look at them for this website too.
---

<script>
	import cascade_layers_bramus_visual from '$lib/img/blog/2023-06-11-css-day-2023-takeaways/cascade-layers-bramus-visual.png'
	import cascade_layers_devtools from '$lib/img/blog/2023-06-11-css-day-2023-takeaways/cascade-layers-devtools.png'
	import cascade_layers_devtools2 from '$lib/img/blog/2023-06-11-css-day-2023-takeaways/cascade-layers-devtools2.png'
	import nested_selector_devtools from '$lib/img/blog/2023-06-11-css-day-2023-takeaways/nested-selector-devtools.png'
	import container_query1 from '$lib/img/blog/2023-06-11-css-day-2023-takeaways/container-queries-devtools.png'
	import container_query2 from '$lib/img/blog/2023-06-11-css-day-2023-takeaways/container-queries-devtools2.png'
</script>

Imagine a conference completely dedicated to CSS. And a former church filled with over 300 CSS enthusiasts. It exists! It's the amazing [CSS Day conference](https://cssday.nl/2023) and I was lucky enough to attend again this year. During the talks I've been taking notes to see **what all the new trends and techniques mean for authoring and auditing CSS**. Note: while it may seem skeptical at many points I do think we're living in a golden era of CSS as Una proved in [the opening talk](https://www.youtube.com/watch?v=TVkwiUFbtyQ) this year.

## Contents

1. [CSS Nesting](#css-nesting)
2. [CSS Cascade Layers](#css-cascade-layers)
3. [CSS Container Queries](#css-container-queries)
4. [Scroll driven animations and the shorthand trash fire](#scroll-driven-animations-and-the-shorthand-trash-fire)

## CSS Nesting

CSS Nesting was mentioned in almost every single talk! Even though it doesn't really seem to add any new capabilities to the language itself, everyone seems to agree that the syntactic sugar adds a lot of benefits to the authoring experience. It's not just nesting selectors, but also nesting atrules like `@media` inside regular old CSSRules.

This will change what CSS ships to the browser, because preprocessors (PostCSS, Sass) currently 'unwrap' nested selectors and make it plainly visible how much nesting authors are applying to their selectors. CSS Nesting will make it harder to debug which 'resolved' selector is being applied, so we need browser vendors to level up their devtools to make inspection of nested selectors easier.

<a href="{nested_selector_devtools}">
	<img loading="lazy" decoding="async" width="1120" height="504" alt="Example 'unwrapping' in Chrome Devtools" src="{nested_selector_devtools}">
</a>

In the example above you can see that Chrome Devtools (Chrome 114) are trying to add helpful context about the selector, but there's multiple levels of nesting, so we don't get to see the full resolved selector here, which is inconvenient.

<aside>Update 13-06-2023: Apparently <a href="https://twitter.com/bramus/status/1668711607222902785">the Chrome team is aware</a> of this inconvenience and they're looking into it.</aside>

Time will tell how much profit CSS nesting will bring us. Writing the CSS will become faster, but debugging it will become harder as it requires more tooling or mental gymnastics to surface the resolved CSS.

<aside>
	<p>Project Wallace should definitely help you figure out the complexity of your CSS, even when CSS nesting is present. It will involve a structural overhaul of the core of our <a href="https://github.com/projectwallace/css-analyzer">CSS analyzer</a>, but I feel strongly about this and our analysis should be able to help calculate Selector and AtRule complexity, even in complex situations.</p>
</aside>

## CSS Cascade Layers

Many talks mentioned CSS Cascade Layers as a good way to manage specificity and the cascade. And it is! It's such a useful addition to CSS that will help us avoid overly complex selectors and resorting to `!important`.

Layers can be nested, it's even a very nice method to group certain parts of the CSS, like a sort of namespace. But, like CSS Nesting, it brings with it some difficulties in inspecting the final CSS. A declaration can be nested several layers deep, so to debug why certain properties are applied we need some sort of view of the resolved layer tree. Luckily, both Firefox and Chrome devtools are already on the case, but with different levels of completeness.

<figure>
	<a href="{cascade_layers_devtools}">
		<img loading="lazy" decoding="async" width="2313" height="1314" alt="Firefox (v113) devtools showing the cascade layers involved" src="{cascade_layers_devtools}">
	</a>
	<figcaption>Firefox (v113) devtools showing the cascade layers involved</figcaption>
</figure>

<figure>
	<a href="{cascade_layers_devtools2}">
		<img loading="lazy" decoding="async" width="1970" height="1494" alt="Chrome (v114) devtools showing the resolved layers as well as the resolved layer tree of all layers in the CSS." src="{cascade_layers_devtools2}">
	</a>
	<figcaption>Chrome (v114) devtools showing the resolved layers as well as the resolved layer tree of all layers in the CSS.</figcaption>
</figure>

Chrome showing the full layer tree is something I very much appreciate, because it will help you visualize the high-level architecture of your CSS.

<aside>
	<p>Wallace should add support for showing the layer tree as well and it's been something I've been thinking of for over a year now, because <a href="https://www.bram.us/">Bramus</a> showed <a href="https://slidr.io/bramus/the-css-cascade-a-deep-dive-2022-06-09-css-day#85" rel="noreferrer">this excellent visual</a> last year at the same conference (!).</p>

    <figure>
    	<a href="{cascade_layers_bramus_visual}">
    		<img loading="lazy" decoding="async" width="2010" height="1184" alt="Screenshot of Bramus' slide of last year's talk about CSS cascade layers, showing a stacked bar chart of colord blocks, each representing a distinct CSS layer atrule, proportionally sized to the amount of rules/declarations inside them." src="{cascade_layers_bramus_visual}">
    	</a>
    	<figure>This visual has been on my mind all year and I hope we can bring it to this silly little website very soon!</figure>
    </figure>

</aside>

## CSS Container Queries

Container queries will change our code from mostly writing `@media` to writing `@container` to proportionally size our layouts and components. [Miriam Suzanne](https://www.miriamsuzanne.com/) [articulated quite well](https://www.youtube.com/watch?v=-Fw8GSksUIo&list=PLjnstNlepBvOG299LOrvMFJ8WreCDWWd4&index=9) that it is very likely that we'll use `@container` for sizing elements and use `@media` to make decisions based on the OS level, like dark mode, and reduced motion.

<figure>
	<a href="{container_query1}">
		<img loading="lazy" decoding="async" width="2872" height="1284" alt="Example Firefox devtools for container query" src="{container_query1}">
	</a>
	<figcaption>Firefox devtools shows the actual size of the container element which makes for easy debugging, as well as showing the <code>container-type</code>, <code>container-name</code> and size query.</figcaption>
</figure>

<figure>
	<a href="{container_query2}">
		<img loading="lazy" decoding="async" width="2880" height="1092" alt="Example Chrome devtools for container query" src="{container_query2}">
	</a>
	<figcaption>Chrome devtools shows the <code>container-name</code>, <code>container-type</code> and size query.</figcaption>
</figure>

It looks like Firefox is very much on top of the game here, although Chrome's devtools are _perfectly_ usable as well.

<aside>
	<p>One thing I would add to our own analyzer is to write detection for unused <code>container-name</code>s and unknown named <code>@container</code>s. We warn for empty CSS Rules, so why not unused/undeclared container names?</p>
</aside>

## Scroll driven animations and the shorthand trash fire

A couple of demos and talks showed off the amazing things we can build with Scroll Driven Animations. I'm not going to explain them here, so if you need examples you can check the ones from [Jhey](https://jhey.dev/cheep/rotating-gallery-with-css-scroll-driven-animations/) or [Bramus](https://www.bram.us/2023/05/16/whats-new-in-web-animations/).

One thing that stood out is that the new `animation-timeline`, `animation-composition` and `animation-range` properties [cannot be combined](https://twitter.com/bramus/status/1667916024107216897) with the `animation`-shorthand property.

```css
/* WARNING: will not work */
#square {
	animation: 3s demoAnimation alternate scroll(block nearest);
}

/* This works */
#square {
	animation-name: demoAnimation;
	animation-duration: 3s;
	animation-direction: alternate;
	animation-timeline: scroll(block nearest);
}

/* Or, if you're a fan of shorthand, this works too */
#square {
	animation: 3s demoAnimation alternate;
	animation-timeline: scroll(block nearest);
}
```

Adding that extra property to the `animation` shorthand would have made it a bit difficult, if not impossible, to parse correctly. Or as Tab Atkins said it:

> <q>the animation shorthand is already a trash fire of parsing</q>

[CSS Working Group meeting notes, 20-03-2023](https://github.com/w3c/csswg-drafts/issues/8054#issuecomment-1476502277)

<aside>
	<p>This problem strengthens my belief that <a href="https://csswizardry.com/2016/12/css-shorthand-syntax-considered-an-anti-pattern/">CSS shorthands are an anti-pattern</a> and should be avoided in most cases. Maybe we should even go so far as actively warning against them on this website as they make auditing your CSS more complex too. Anyway, this could easily be a blog post in itself&hellip;</p>
</aside>

---

CSS is moving at rocket-speed pace and I'm a big fan of all the attention it's getting from all browser vendors. There's [more tools coming in our browsers on a daily basis](https://hacks.mozilla.org/2023/02/announcing-interop-2023/) and I'm so grateful to all browser and devtools teams for their hard work.
