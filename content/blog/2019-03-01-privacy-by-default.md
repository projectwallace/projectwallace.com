---
excerpt: A recent REWORK podcast episode triggered me thinking about user privacy and this post explains how we deal with privacy.
author: bartveneman
title: Privacy by default
---

TLDR; there's no tracking on Project Wallace.

A [recent episode](https://rework.fm/100-facebook-free/) of the REWORK podcast triggered me to question the only client-side script that Project Wallace contains: Google Analytics. The folks at Basecamp had decided to become a [100% Facebook-free business](https://m.signalvnoise.com/Become-A-Facebook-Free-Business/). One of the reasons being that Facebook is more and more known for privacy-related scandals. It got me thinking about the privacy of my users.
I decided that there is no good reason to include a library like Google Analytics (GA) on Project Wallace.

## Reasons to remove the Google Analytics snippet

- I have no idea what Google does with the data it gathers, and it just doesn't feel right that I cannot control how much data it gathers and shares.
- I'm no GA expert, and I don't even know how to setup goals or advanced tracking, so all I do is including the default snippet and hoping that some day something smart can be seen.
- The snippet is only loaded if the browser did not have ['Do Not Track' (DNT)](https://www.eff.org/issues/do-not-track) enabled, because I tried to be thoughtful of users' privacy preferences. This leads to incomplete tracking results and might give misleading insights.
- The snippet isn't loaded if you have any kind of tracking blocker. Again, leading to misleading results.
- Loading client-side JS is essentially making the site slower. The impact of a default GA snippet is pretty minimal, but still, it's going to make the site load slower.

The GA snippet was [removed on 28 January 2019](https://twitter.com/projectwallace/status/1089994374350540800), making Project Wallace completely tracking-free. As a user of many other sites, I always hope that other site owners think really hard about the trackers they include in their pages. Is it really necessary? Can your business live without it? Are there other, less-invasive ways of gathering the data points you need to answer your questions?

## Default privacy on Project Wallace

- There are no tracking scripts. Actually, there are no client-side scripts _at all_, except on the pricing/payment page, because that's [powered by Stripe](https://stripe.com/docs/checkout).
- Project Wallace only asks for a minimal amount of user data, like email and name. There's nothing to steal or leak if you cannot give us any more data. So we won't let you, except if you want to fill in your bio or relevant links in your profile.
- The only tracking that I can do is reading directly from the data storage and a _tiny_ bit of logging around malicious requests, but that's all. And it's all I need.
- No data is shared with, or sold to anyone else. There never has been.

Anyway, I have decided that the data I need to improve Project Wallace will have to come from talking to the users of the platform. Luckily the [@projectwallace](https://twitter.com/projectwallace) Twitter account is picking up steam quickly and conversations are starting to take place. That'll do. Stay safe everyone!
