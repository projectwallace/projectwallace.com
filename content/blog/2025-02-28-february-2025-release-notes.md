---
title: February 2025 release notes
excerpt: A new feature on the site that has been on the list for years and it's finally here!
---

<script>
  import item_highlight from '$lib/img/blog/2025-02-28-february-2025-release-notes/item-usage-highlight.png?enhanced'
  import item_highlight_full from '$lib/img/blog/2025-02-28-february-2025-release-notes/item-usage-highlight.png'
  import diffstat from '$lib/img/blog/2025-02-28-february-2025-release-notes/diffstat.png?enhanced'
  import diffstat_full from '$lib/img/blog/2025-02-28-february-2025-release-notes/diffstat.png'
  import resize from '$lib/img/blog/2025-02-28-february-2025-release-notes/resize.png?enhanced'
  import resize_full from '$lib/img/blog/2025-02-28-february-2025-release-notes/resize.png'
  import pseudo_classes from '$lib/img/blog/2025-02-28-february-2025-release-notes/pseudo-classes.png?enhanced'
  import pseudo_classes_full from '$lib/img/blog/2025-02-28-february-2025-release-notes/pseudo-classes.png'
</script>

39 production releases with performance improvements, bug fixes and a couple of new features. Let's start with an absolute banger!

## New features

This one has been on my list for _ages_ and the recent upgrade to Svelte 5 and this [video from Huntabyte about Svelte 5, context and classes](https://www.youtube.com/watch?v=e1vlC31Sh34) helped me get it over the line:

### 🎉 CSS is maintained between page navigations

You rarely audit one website or file in isolation. Wallace has many pages and depending on the CSS or the goal you want to either check code quality scores, CSS `@layer` composition or custom property usage. Before this change you always needed to re-enter the URL or upload the file again. Well, no more! Click to another page and the CSS will still be there.

### Other new stuff

- The CSS Scraper pages now has it's own network panel. It's the same one you're familiar with from the analyzer and layers pages. While writing these release notes I spotted a very nasty UI bug so expect that to be fixed soon.
- Pseudo classes analysis because this is rather useful when looking for usage of `:popover-open` or other new-ish selectors that might not be readily available yet in all browsers.
  <a href={pseudo_classes_full}>
  <enhanced:img src={pseudo_classes} alt="A table of 12 CSS pseudo classes, sorted by count." loading="eager" fetchproprity="high" />
  </a>

## Updated features

- Syntax highlighting in the [AST Explorer](/ast-explorer) input field. It was a tricky one, but some blog posts from GitHub and Sentry helped me along the way to finetune it. We're (still) not using a virtualized list because the input for the AST Explorer is usually quite small and doesn't warrant the overhead of such a tool.

- Syntax highlighting in item usage devtools.

  <a href={item_highlight_full}>
    <enhanced:img src={item_highlight} alt="Item usage devtools showing a table of syntax highlighted CSS rulesets" loading="lazy" />
  </a>

  After implementing sytax highlighting in most large `<pre>` blocks I fgured it was time for smaller chunks of code to look nice too.

- Calculating the diffstat on the [CSS Diff page](/css-diff) is now a lot more accurate on large diffs as well as being a bunch faster. I'm really into using typed arrays in JavaScript lately, so the diffstat is now a `Uint8Array()` with 5 integers: `0` for unchanged, `1` for deletions and `2` for additions.

  <a href={diffstat_full}>
    <enhanced:img src={diffstat} alt="A git diff shown with a diffstat above it saying that there were 5 changes: 3 additions and 2 deletions. It shows 5 squares, 3 green and 2 red." loading="lazy" />
  </a>

### Split panes

The AST Explorer was the first page where I implemented the excellent [PaneForge](https://paneforge.com/) library to have resizable elements. I liked the ability of dragging interface elements so much that this is now available in the following places:

- AST Explorer
- Custom Properties analyzer
- CSS Coverage analyzer
- Devtools networkpanel
- Devtools item usage

Resize and render performance isn't exactly great in some of these places when bombarding it with big CSS input, but it's on my radar and some day I'll fgure out how to tackle that.

<a href={resize_full}>
  <enhanced:img src={resize} alt="Wallace devtools network panel with the horizontal resize handle being highlighted" loading="lazy" />
</a>

## Dependencies

- [@bramus/specificity version 2.4.0](https://github.com/bramus/specificity/releases/tag/v2.4.0) was released and contains some of my own fixes and improvements so projectwallace.com now also uses the latest and greatest.
- [css-analyzer v6 is released](https://github.com/projectwallace/css-analyzer/releases/tag/v6.0.0) and it contains some long overdue breaking changes and some bug fixes for issues that I was able to spot because Sentry flagged them.
- [css-code-quality v2 is released](https://github.com/projectwallace/css-code-quality/releases/tag/v2.0.0) as an effect of releasing css-analyzer v6. It depends on the analyzer and had one deprecation to be removed.

### Performance

A lot of the sorting functions used on the analyzer page are now faster because we store the sorted elements in a `Uint32Array()` instead of creating copies for _every single list_. This is worth a blog post on it's own, so I'll probably postpone that until... Well. Long.

---

A lot of this month was preparing releases, upgrading dependencies across the board and making sure nothing broke in the process.

Do you enjoy these release notes? Please let me know via BlueSky or LinkedIn.

That's it for this month!
