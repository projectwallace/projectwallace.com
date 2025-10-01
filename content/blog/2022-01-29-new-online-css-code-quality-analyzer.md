---
title: 'New: CSS Code Quality analyzer'
excerpt: It's like Lighthouse, but for CSS specifically.
author: bartveneman
---

_TL;DR: See your CSS Code Quality in numbers in a single glance on [our Online CSS Code Quality Calculator](https://www.projectwallace.com/css-code-quality)_

Ever since I started Project Wallace years ago, I've been missing something. Because every time you open a project or do a one-off analysis it's difficult to see in a quick glance how you're doing. Is it good? Is it bad? Is it really bad? Well, let's scroll for a couple of seconds and try to make sense of what is shown on the page. If you understand most metrics, that is.

Well, at the start of this year, [it finally clicked](https://twitter.com/projectwallace/status/1477687128087830533):

> Starting off the new year with an attempt to write a CSS code quality tool.... :sweat_smile:<br><br>Points deducted for complexity, performance anti-patterns etc etc.<br><br>Think @\_\_\_\_lighthouse, but for CSS specifically.

The responses were quite good. A couple dozen likes, retweets and folks showing interest. It doesn't seem much, but for an account as small as Project Wallace that's a lot. That was enough to get me started and after a couple of evenings, it started to look pretty good. I decided to not polish it too much at this stage but to put it online and gather feedback to improve it.

The basic idea is that you give us your CSS and we will come up with a code quality score that's made up of 3 separate topics: maintainability, complexity and performance. Each topic's score is the result of several tests that we run against your CSS. We deduct points for each anti-pattern we encounter. The end score will be what's left of an initial 100 points for each topic.

**So here it is: Project Wallace's Code Quality Analyzer.**

<script>
	import screenshot from '$lib/img/blog/2022-01-29-css-code-quality-analysis/screenshot.png'
</script>
<img src={screenshot} alt="Example CSS Code Quality output from https://www.projectwallace.com/css-code-quality" loading="lazy" width="904" height="1282">

The score list shows each test and whether you're scoring poor (red), ok (orange) or good (green).

I hope you'll enjoy this feature. Please let me know what you think of it and have fun checking your own website(s) and those of your frenemies ;)
