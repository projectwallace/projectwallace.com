---
title: Sorting colors in CSS
author: bartveneman
excerpt: Sorting colors in CSS is hard. I've found a method to make it look pretty decent
---

TLDR; Sorting colors in CSS is hard. I've found a method to make it look pretty decent (highly opinionated): [Color Sorter repo on Github](https://github.com/projectwallace/color-sorter)

One of the goals that I've had since the inception of Project Wallace is to show which colors are present in your CSS. Ever since the beginning the most feedback has been around the color analysis. People seem to enjoy a list of colors ¯\_(ツ)\_/¯. One thing that bothered me however was that it was hard to visually grep how colors were related so I decided to start sorting them.

## The solution

My knowledge of color theory is limited to the basics of the color wheel, so I'm using this as my starting point. I also already know that I want to make a clear difference between black-grey-white values and saturated colors. Thanks to [TinyColor](http://bgrins.github.io/TinyColor/) every color can be converted to an HSL value, so I can use the hue, saturation and lightness properties of each color. So, here we go:

1. Sort the colors by hue (red/yellow/green/blue/purple (0-360) degrees on the color wheel)
1. If the hue of two colors is the same, order them by saturation
1. Take every color in the grey spectrum (meaning that the saturation equals 0), and move that to the end of our color list
1. Order the grey-ish colors by their alpha channel
1. If the alpha channel is the same for both colors, sort them by lightness

Take a look at [the examples](https://github.com/projectwallace/color-sorter#examples) in the repo to see the results for several well-known sites.

## The bad parts

- It is pretty much impossible to properly handle the differences in the alpha-channel (opacity). A color that is 90% transparent will look totally different than that same color with 0% transparency.
- This sorting is based on my own taste and has no solid base in color theory. It just needs to look good for me.
