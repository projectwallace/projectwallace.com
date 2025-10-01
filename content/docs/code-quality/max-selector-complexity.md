---
title: Avoid complex selectors
unit: Complexity points at most
format: number
category: complexity
---

High complexity means that a Selector consists of several parts, each of which adds to the complexity of understanding what the Selector targets. Low complexity means that a Selector is easy to understand.

```css
/* complexity = 1 */
.selector {
}

/* complexity = 5 */
.selector :where(#many, .parts, [exist]) {
}
```
