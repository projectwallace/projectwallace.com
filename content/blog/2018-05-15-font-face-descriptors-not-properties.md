---
title: '@font-face descriptors are not properties'
excerpt: Sometimes there are less properties reported than you are expecting. Here is why.
author: bartveneman
---

Here is some piece of CSS you've probably seen before:

```css
@font-face {
	font-family: 'MyCustomFont';
	src: url('/path/to-font.woff2');
}

.my-component {
	font-family: 'MyCustomFont';
}
```

When it comes to analyzing CSS it is tempting to count that `font-family` and `src` inside the `@font-face` as regular properties, but technically they are not. They are descriptors.

## The theory

> A CSS descriptor defines the characteristics of an at-rule. At-rules may have one or multiple descriptors. Each descriptor has:
>
> - A name
> - A value, which holds the component values
> - An "!important" flag, which in its default state is unset
>
> [CSS Descriptor, MDN web docs](<https://developer.mozilla.org/en-US/docs/Glossary/descriptor_(CSS)>)

In the case of our example, the `font-family` and the `src` are the descriptors of the `@font-face` at-rule.

## Common CSS parser implementations

Most CSS parsers, like PostCSS and ReworkCSS take those lines as declarations because it fits better in the Abstract Syntax Tree that they are constructing. And that's fine, because these parsers are aimed at performing operations on the CSS to transform it into something else. But when it comes to analyzing the tree, we must take note that the 'properties' inside `@font-face`s are actually descriptors.

## Consequenses for CSS statistics

- Less properties are counted than you might expect
- Specifically: less font-related properties, which usually means there are less font-families to show in your projects' [font-family details pages](https://www.projectwallace.com/teamwallace/project-wallace/fontfamilies)

## More information

Read more about CSS descriptors:

- [The W3C Spec](https://www.w3.org/TR/css-fonts-3/#font-face-rule) If you're into the fine details of the `@font-face` descriptors
- [CSS font-family Descriptor](https://www.quackit.com/css/at-rules/descriptors/css_font-family_descriptor.cfm) A readable explanation, and more great docs about CSS
- [`@font-face` at MDN Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face)
