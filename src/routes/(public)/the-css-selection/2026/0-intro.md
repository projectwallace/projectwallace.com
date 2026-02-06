<script>
import PolypaneBanner from './PolypaneBanner.svelte'
</script>

## Introduction

Welcome to **The CSS Selection 2026**! In this article we're having a look at how CSS is used at scale on over 100,000 websites. We'll look at what things are common on most websites and discover interesting outliers. This is the first edition of what I hope to be many, so this is meant as a baseline for future editions, setting up the first numbers to compare with in coming years.

This article exists for several reasons, but the [Web Almanac](https://almanac.httparchive.org) is the most prominent one. For several years the Web Almanac has skipped the [CSS chapter](https://almanac.httparchive.org/en/2022/css), the last one published in 2022. This is mainly because of a shortage of authors and editors but mostly analysts who could wrangle BigQuery to get hold of large amounts of CSS data to analyze and put it in readable charts. Additionally, the Web Almanac uses a regex-based CSS analyzer that differs a lot from Project Wallace's analyzer. This has bothered me for years because I think the CSS community deserves a yearly overview, as well as that overview having the best-in-class analysis. Now, I can't crawl millions of websites like the HTTP Archive can, but I can do 100,000 and still make a pretty decent overview. This mostly explains why there will be some differences in what Almanac articles have found in previous years and what our analysis shows.

<PolypaneBanner></PolypaneBanner>

CSS has taken flight in recent years with many new features, properties, values, at-rules and so much more. With power shifting to CSS, it's interesting to look at the use of these new features as well as to keep an eye on global metrics like file size, units used etc. We'll work our way down from the top, so we'll start by looking at stylesheet composition, followed by at-rule analysis, then rules, selectors, declarations, and lastly, values and units.
