---
title: How to create a Naked CSS theme without removing CSS
excerpt: 7 lines of code to make your website look naked
---

[CSS Naked Day](https://css-naked-day.org/) is celebrated each year on 9 April. The point is that navigating a website without CSS applied is a powerful way of doing accessibility testing and adhering to Web Standards. How many accessibility flaws is your CSS hiding for you? Just as much as [JS might not always be loaded/executed](https://www.kryogenix.org/code/browser/everyonehasjs.html) your CSS might not load as well and that's equally problematic.
The official site suggests ways to *remove* all CSS, but sometimes that’s not practical. Maybe you're working in a locked-down CMS, or dealing with a complex build setup (hi Vite and SvelteKit). But *adding* CSS? That’s usually pretty easy.

So this post shows you how to make your website look naked in just 7 lines of code!

```css
[data-theme="naked"] {
	color-scheme: dark light !important;

	&,
	& :is(*, *::before, *::after) {
		all: revert !important;
	}

	& [aria-hidden='true'] {
		display: none !important;
	}
}
```

## Code breakdown

1. Select the document and all elements inside it. For me the `data-theme="naked"` is applied to the `&lt;html&gt;` element: `&lt;html data-theme="naked"&gt;`

	```css
	[data-theme="naked"] {
		/* ... */
	}
	```

2. Revert everything

	Modern CSS gives us `all: revert` and when applying that in my website's CSS [it basically means](https://developer.mozilla.org/en-US/docs/Web/CSS/all#values) that it 'removes' all of my styles without deleting my CSS.

	```css
	[data-theme="naked"] {
		/* ... */

		&,
		& :is(*, *::before, *::after) {
			all: revert !important;
		}

		/* ... */
	}
	```

3. Set color scheme (optional)

	Wallace has a dark theme by default so here I tell the browser that removing all styles makes the website still dark by default but also respond to a light preference.

	```css
	[data-theme="naked"] {
		color-scheme: dark light !important;

		/* ... */
	}
	```

4. Bonus: hide inaccessible content

	I'm hiding all elements that have `aria-hidden="true"` because they are only useful visually, not for assistive technology. So that's why it makes sense for me to hide these elements just to check how I navigate the website without them.

	```css
	[data-theme="naked"] {
		/* ... */

		& [aria-hidden='true'] {
			display: none !important;
		}
	}
	```

---

There is no automation on this site to automatically apply the naked theme on April 9th. That seems a bit drastic for me. You can choose it in the theme picker in the header, though. I do it myself from time to time and it's really helpful.
