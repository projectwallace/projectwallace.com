---
title: Avoid many Selector code duplications
unit: Selector duplication
format: percentage
category: performance
---

To keep filesize at a minimum, Selectors should not be repeated too often. A lot of duplicated Selectors are a sign that something could be abstracted away or pieces are possibly obsolete and need a cleanup.

Scoring high here means a lot of Selectors appear multiple times in the CSS.

```css
.selectorA {
}

/* more CSS */

.selectorA {
}
```
