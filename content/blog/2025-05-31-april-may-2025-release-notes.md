---
title: April + May 2025 release notes
excerpt: Close your eyes! Or not. We have a light theme now. And no theme at all. And some other new stuff that you will probably like.
---

<script>
  import light_theme from '$lib/img/blog/2025-05-31-april-may-2025-release-notes/light-theme.png?enhanced'
  import light_theme_full from '$lib/img/blog/2025-05-31-april-may-2025-release-notes/light-theme.png'
	import naked_theme from '$lib/img/blog/2025-05-31-april-may-2025-release-notes/naked-theme.png?enhanced'
  import naked_theme_full from '$lib/img/blog/2025-05-31-april-may-2025-release-notes/naked-theme.png'
	import counterscale from '$lib/img/blog/2025-05-31-april-may-2025-release-notes/counterscale.png?enhanced'
  import counterscale_full from '$lib/img/blog/2025-05-31-april-may-2025-release-notes/counterscale.png'
</script>

## New features

- A light theme! For those who prefer a light website or for those standing in bright sunlight.
  <a href={light_theme_full}>
		<enhanced:img src={light_theme} alt="This very website shown in a light theme: a white background with dark text." loading="eager" />
	</a>

	The idea for this had long been on the todo list but [a recent Syntax video](https://www.youtube.com/watch?v=F1s8MZoGVL8) opened my eyes and made me bite the bullet. My implementation uses cookies instead of localStorage but most of the heavy lifting is still done by the CSS `light-dark()` function.
- A 'naked CSS' theme! For those celebrating [CSS Naked Day](https://css-naked-day.org/).

	<a href={naked_theme_full}>
		<enhanced:img src={naked_theme} alt="This very website shown without a theme. It shows the bare text elements with no styling applied at all." loading="lazy" />
	</a>

	Fun fact: implementing this was only 8 lines of code!

	```css
	[data-theme="naked"],
	[data-theme="naked"] * {
		all: revert !important;
		color-scheme: dark light !important;

		[aria-hidden='true'] {
			display: none !important;
		}
	}
	```

	But this is also a darn good way of finding accessibility issues.

- The [CSS `@layer` visualizer](/css-layers-visualizer) page already had some devtools panels on it and now also includes the JSON output panel from the [css-layer-tree library](https://github.com/projectwallace/css-layer-tree) that powers it. This allows for easy copy-pasting so you can use the result somewhere else.
- The [Custom Property Inspector](/custom-property-inspector) now also has some devtools panels, like a network panel and a panel with the JSON output of all the properties that were inspected. In there you'll find arrays of All properties, Unused properties, Undefined properties and Underfined with fallback properties.
- The selectors you enter on the [Specificity Calculator](/specificity-calculator) are now synced to the URL for easy sharing.
- New website analytics. After saying goodbye to Fathom last fall after many years of using it I found myself needing a new source of analytics. Sentry catches the occassional error but when Sentry stays quiet I get nervous, because how do I know if anyone is still using the website? Luckily [Counterscale](https://counterscale.dev/) is a free, performant and privacy-focused solution!

  <a href={counterscale_full}>
		<enhanced:img src={counterscale} alt="Counterscale analytics dashboard. 4.1K visitors, 7.9K views." loading="lazy" />
	</a>

	I haven't looked at my 'old' numbers but I have the feeling that there are more page views and visitors than a year ago. Over 4000 visitors and almost 8000 page views seems like a lot! The high number of page views for the CSS Scraper is surprising but according to Google they have been sending more traffic that way so I guess that checks out.

	It'll be fun to an end-of-year summary again although I need to keep track of these numbers myself because they'll be gone after 90 days.

## Updated features

- Removed the resizeable panes from the AST Explorer and Custom Properties Inspector pages. [Paneforge](https://paneforge.com) is great but for some reason the panes would always collapse on initial page render without a good reason and even worse: no errors logged.

## Bug fixes

- Clicking a used property in the custom property inspector sidebar would always scroll and highlight the declared property, not the used one. This is now fixed.
- Guess what? Some of our own custom properties were broken. Using the custom property inspector helped me find and fix them 🙈
- Several unlisted bugs that Sentry caught. Several. Take that from me.

## Dependencies

- All of the `@projectwallace` packages are now ESM only for a smaller install size, mostly cutting their `node_modules` size by 50%
  - https://github.com/projectwallace/css-analyzer
	- https://github.com/projectwallace/css-layer-tree
	- https://github.com/projectwallace/color-sorter
	- https://github.com/projectwallace/css-code-quality
	- https://github.com/projectwallace/format-css
	- https://github.com/projectwallace/css-time-sort
- Previously *all* tests for this website were done by Playwright. Now they're split into unit tests (Vitest) and end to end tests (Playwright). This makes discovering bugs a little easier because of a better distinction in CI.
- Implemented Stylelint in the repository powering this website. Only a fairly basic config, but helpful nonetheless.

## Performance

- Previous release notes mentioned a performance improvement for syntax highlighting blocks of CSS. This is now updated from a arbitrary `setTimeout()` to `requestIdleCallback()` if supported by the browser.
- The theme switch, navigation popover and CMD+K menu were previously powered by a [Melt popover](https://www.melt-ui.com/docs/builders/popover). They're now fully [HTML `popover`](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using) elements! Hooray for the web!

---

There are fewer notes than usual but that's because the weather here has been very nice and I've been doing a ton of gardening and chores around the house. I highly recommend going outside more! After all, this is just a side project. 😉

