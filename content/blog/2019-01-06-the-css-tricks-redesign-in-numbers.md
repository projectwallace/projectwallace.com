---
excerpt: CSS Tricks got a fresh coat of paint and boy, does it look good! But what exactly changes in CSS statistics after such a big redesign?
author: bartveneman
title: The CSS Tricks 2019 redesign in numbers
---

On the 1<sup>st</sup> of January [CSS-Tricks.com](https://css-tricks.com) got a fresh coat of paint, and what a looker she is! Chris Coyier and his team have done an excellent job at delivering a stunning looking website. A redesign at such scale (CSS Tricks is no tiny website) is interesting to look at from a CSS analysis perspective, so let&rsquo;s do that.

(If you just want to take a look at the raw numbers: [Compare CSS Tricks 30 Dec 2018 21:18:23 to 1 Jan 2019 20:27:56](https://www.projectwallace.com/teamwallace/css-tricks/imports/20190101202756143))

## A quick overview of numbers

Here are some numbers that&rsquo;ll tell us just how big this redesign has been. These are some stylesheet-wide numbers that tell something about the CSS in general.

| Metric       | Before | After  | Difference |
| ------------ | ------ | ------ | ---------- |
| Filesize     | 296 kB | 176 kB | -40.48%    |
| Rules        | 1592   | 1494   | -6.16%     |
| Selectors    | 2951   | 2380   | -19.35%    |
| Declarations | 4090   | 4146   | +1.37%     |

The drop in filesize is one of the most significant changes. A reduction of more than 40%! That is a massive achievement and I suspect the team have thrown away a large chunk of the previous codebase that became obsolete.

## Changes in design

The most notable change in a redesign is the visual aspect of things, so let&rsquo;s find out how that reflects on the brand-related metrics in the statistics.

| Metric        | Before | After | Difference |
| ------------- | ------ | ----- | ---------- |
| Colors        | 175    | 137   | -21.71%    |
| Font-sizes    | 175    | 137   | -30.88%    |
| Font-families | 7      | 8     | +14.29%    |

The amount of unique colors and font-sizes have decreased quite a lot. I suspect that the team focused on building a more consistent looking UI. Fun fact from the [font-family department](https://www.projectwallace.com/teamwallace/css-tricks/imports/20190101202756143#values.fontfamilies.unique): no more icon fonts!

## Changes in complexity

Complexity in CSS is hard to define based on a couple of numbers, but here is a small list of numbers that I use to audit a codebase that I don&rsquo;t own on complexity.

| Metric                           | Before | After | Difference |
| -------------------------------- | ------ | ----- | ---------- |
| ID selectors                     | 369    | 298   | -19.24%    |
| Universal selectors              | 11     | 12    | +9.09%     |
| Average identifiers per selector | 3.39   | 2.81  | -17.10%    |
| Maximum identifiers per selector | 10     | 10    | 0.00%      |
| Property browserhacks            | 24     | 0     | -100.00%   |
| !importants                      | 82     | 60    | -26.83%    |
| !importants (%)                  | 0.02   | 0.01  | -27.82%    |

One metric in particular draws my attention here: **average identifiers per selector**. This metric is a tough one to improve and seeing that it went down with a whopping 17% just blows my mind. That means that _a lot of selectors_ have gotten _a lot less nesting_. In terms of complexity that means that the CSS is a lot less tied to the HTML, which is usually a good thing.
Also, having a lot less ID selectors means that there&rsquo;s a whole lot less of specificity to deal with.

## Closing thoughts

I think the CSS-Tricks Team have done a great job at this redesign. The design aspect is excellent and it feels so much fun to browse around the site. While having &rsquo;good&rsquo; stats was certainly not something that the team had in mind when working on the redesign, I think they did an excellent job on decreasing complexity and increasing cohesion. Bravo!

I would love to read a blog post from the engineering/design team that created this new design to see what they think about these numbers.
