---
title: Wallace in the news
excerpt: Excitement all around as Project Wallace is featured in the State of CSS survey, mentioned on Syntax.fm and helped improve Polypane's devtools!
---

<script>
	import survey from '$lib/img/blog/2023-10-13-in-the-news/survey.png'
	import polypane from '$lib/img/blog/2023-10-13-in-the-news/polypane.png'
	import syntax from '$lib/img/blog/2023-10-13-in-the-news/syntax.png'
</script>

Just a short post to share my excitement that Project Wallace has been mentioned in public by some pretty cool people!

## State of CSS

<img src={survey} alt="Overview of all utilities listed on the State of CSS" loading="eager" width="1092" height="755">

Thanks to [Romain](https://twitter.com/romainmenke/status/1670852482174468096) we were listed under [the 'utilities' section](https://2023.stateofcss.com/en-US/other-tools/), which means we're not a framework or a bundler, basically. It really helps getting this sort of exposure and I can see a slight increase in traffic and CSS analyzed because of this. Very cool to see Project Wallace listed in such an influential survey, even though I'm fully aware that my impact is very, very small. 30 of you indicated that they've been using Project Wallace from time and even though that's not much compared to the other tools, it's enough validation for me to keep going!

## Syntax.fm

<img src={syntax} alt="Screenshot of the Syntax.fm website with the show notes" loading="lazy" width="1081" height="738">

Listening to the latest Syntax.fm episode certainly had me excited when Scott and Wes started talking about Project Wallace! I've been a Syntax listener from day one and I really appreciate the hard work they put into making the podcast. They've clarified dozens of On this episode they're discussing the results of the [State of CSS survey](https://2023.stateofcss.com/en-US) where they discover that Project Wallace is a pretty neat tool to keep your color distribution in check or to review all font-families in use. My favorite quote from the show, mostly because of Scott's audible amazement:

> This **is** cool!

<cite>Scott Tolinski</cite>

You can listen to [the full episode on the Syntax.fm website](https://syntax.fm/show/678/the-2023-state-of-css-survey-part-2-css-frameworks-tooling-browser-usage#t=22:30). Project Wallace is mentioned around the 22m30s mark.

## Polypane blog

<img src={polypane} alt="Screenshot of the Polypane blog with the section about CSS cascade layers and Project Wallace's visualizer" loading="lazy" width="1333" height="1153">

Kilian from Polypane recently reached out to ask for some feedback about devtools he was building to make using `@layer` easier. He probably spotted that I was working on the [layer visualizer](/css-layers-visualizer) and by the looks of it, he did a great job of visualizing layers in Polypane itself. The devtools now show the full layer tree related to the style rule you're debugging, which is really helpful. He wrote about it in his [Polypane 15 release notes](https://polypane.app/blog/polypane-15-fully-featured-browser-in-the-browse-panel-performance-improvements-chromium-116-and-more/#support-for-complex-layer-nesting), so go try out Polypane if you haven't yet.
