---
title: Metrics
---

All you need to know about the variety of metrics that Project Wallace generates about your CSS.

Here is a top-level list of all sections that the CSS Analyzer provides:

1. ## Stylesheet

   All metrics related to the stylesheet as a whole, like filesize, lines of code, etc.

   [View all _stylesheets_ metrics](/docs/metrics/stylesheets)

1. ## At-Rules

   CSS can contain a lot of at-rules. `@keyframes` and `@media` are some examples, but there are many more.

   [View all _atrules_ metrics](/docs/metrics/atrules)

1. ## Rules

   A rule consists of one more _selectors_ and a block of zero or more _declarations_.

   [View all _rules_ metrics](/docs/metrics/rules)

1. ## Declarations

   A declaration has a _property_, a _value_ and optionally an `!important` flag.

   [View all _declarations_ metrics](/docs/metrics/declarations)

1. ## Properties

   A property tells the browser _which_ styling feature to apply. Properties can also contain vendor prefixes or browser hacks.

   [View all _properties_ metrics](/docs/metrics/properties)

1. ## Values

   A value tells the browser _how_ the browser should style the given styling feature. Project Wallace primarily focuses on branding-related values, like colors, fonts, shadows and animations.

   [View all _values_ metrics](/docs/metrics/values)
