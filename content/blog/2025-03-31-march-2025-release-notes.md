---
title: March 2025 release notes
excerpt: 35 releases but hardly anything that you will notice. Read on to learn why that is a good thing.
---

<script>
  import layers from '$lib/img/blog/2025-03-31-march-2025-release-notes/layers.png?enhanced'
  import layers_full from '$lib/img/blog/2025-03-31-march-2025-release-notes/layers.png'
</script>

35 production releases this month, 4 less than [last month](/blog/february-2025-release-notes). And almost half of those were related to replacing Tailwind CSS with 'plain' CSS and Svelte component-based styles. Yup I finally did it.

Apart from that most effort went into making existing more resilient and adding more test coverage to increase stability.

## New features

None this month.

## Updated features

- The filter buttons in the network panel have been removed. Before this you were able to filter network resources by type like link tags or style tags. It occurred to me I hadn't used this feature in years and had no test coverage for it. Additionally the usage differed a little from how the checkboxes in front of the network resources worked so I decided it's time to let go.
- Aria attributes in sortable table columns have been added in places where they were missing and improved in places where they were already present. Under the hood this involved a bunch of deduplication whic akes it easier to do it right next time.

## Bug fixes

- 💥 Do not crash when `@font-face` contains invalid CSS
- 💥 Do not crash when someone enters a non-URL in a URL field to analyze

## Dependencies

Dropped Tailwind CSS, autoprefixer and postcss. There, it's out there. I still like Tailwind, it's been good for me the last couple of years. But there's this itch that tells me that this silly website about CSS should be written in CSS. But even more so I feel I need to reconnect with modern CSS and learn more about view transitions, cascade layers (aka `@layer`), container queries and theming. So, consider this my first step trying to ship a light theme or a dim one. Or both.

Even though I've tried to do the migration in small pieces you may still occasionally see some broken styling here and there.

<a href={layers_full}>
  <enhanced:img src={layers} alt="A layer tree showing 11 layers." loading="lazy" />
</a>

I even implemented a rudimentary layer architecture right after I finished the migration!

## Performance

- Syntax highlighting of `<pre>` blocks is now postponed 100ms. This should give the browser some breathing room to first apply layout and paint and do syntax highlighting after that. This is mostly noticable when opening our devtools, like when you click a specific color or selector.
- Additionally we now keep track of highlighted strings that we also clean up when the `<pre>` element is unmounted. This solves a memory leak that was actually noticable after analyzing lots of sites.
- The network panel used to keep a _full copy_ of all resources in memory. That's right, even with _all_ the CSS that you downloaded. So your CSS could be 1MB and we would keep another 1MB in memory just so you could sort the whole thing by size or URL. Well, now we store the sorting in a `Uint8Array` that's only as long as the amount of network resources you have. Phew.
- Sorting design token colors by color would always convert every color twice. It's now faster because we [first map the entire array and then sort the result](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort?utm_source=chatgpt.com#sorting_with_map). This is faster because converting the color is relatively slow.

## Resilience

Lots of tests were added this month for the AST Explorer and CSS Coverage pages. This helps me add features more easily because Playwright will warn me when I break something. (not if; _when_)

---

Do you enjoy these release notes? Please let me know via BlueSky or LinkedIn.

That's it for this month!
