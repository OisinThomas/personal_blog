---
title: Leaky Abstractions Redux
description: Your AI Coding Assistant Keeps You Dry—Until It Doesn't
publishedAt: '2025-04-28T11:19:21.679Z'
updatedAt: '2025-04-28T11:19:21.679Z'
author: Oisín Thomas
image: /profile.png
majorTag: Thoughts
subTag: Tech
language: en
available: true
source: Substack
substackUrl: 'https://caideiseach.substack.com/p/leaky-abstractions-redux'
tags:
  - ai
  - software-development
  - abstractions
---

![](https://substack-post-media.s3.amazonaws.com/public/images/19e34fd1-6cfc-4820-b6c7-034fc7e55595_368x489.png)

AI is no bucket; it is just another leaky abstraction.

With Claude, ChatGPT, Gemini the spigot is wide‑open. Code pours out in seconds, tests autocomplete, boilerplate writes itself (_we cheer, until we scroll back and realise we don’t understand half of it_). For a while you stay comfortably dry, colander held high above your head. Then a drop lands on your keyboard and you remember [Joel Spolsky’s Law of Leaky Abstractions](https://www.joelonsoftware.com/2002/11/11/the-law-of-leaky-abstractions/) reminds us that every interface—TCP over IP, SQL over disk blocks, even a string class over raw bytes—lets reality seep through under load. AI assistants are just another layer, and they’ve drilled a few fresh holes in the bucket.

### What the Colander Hides

AI assistants offer a torrent of conveniences. Knowledge lookup becomes instant; no more late-night trawling through docs when the model dredges answers from the deep. Boilerplate and syntax, those repetitive chores, vanish like water through mesh. Debugging rituals dissolve, as error messages swirl away before you even inspect them. Data structures and algorithms materialise saving you a mental lookup every time. Even language idioms and best practices are rinsed down into a one-line suggestion.

And I admit: I’m a big proponent of [vibe-coding](https://x.com/karpathy/status/1886192184808149383). Speaking aloud, using tools like [Wispr Flow](https://wisprflow.ai/) and [C](https://cline.bot/)_[line](https://cline.bot/)_, lets ideas pour out naturally, reducing the latency to coding. When done well, vibe-coding preserves rhythm, clarity, and makes it easier to catch leaks before they spread. But non-determininism doesn’t mean it always works.

### Where the Water Escapes

When things go wrong, it’s rarely just one drop—it’s a cascade. The model might hallucinate a missing import for a core library. It might regress to the mean, spitting out cookie-cutter solutions that just don’t capture the nuance of what you need. Maybe it leaves security gaps wide open, or churns out naive loops that drag performance down. Gnarly edge case? _Fuggedaboutit_.

Sometimes the leaks are obvious; sometimes they trickle quietly behind the scenes; but, the more pressure you put behind the abstraction, the more it strains and the more it spills.

This is as much a note to self as to anyone else: Skill atrophy isn’t a distant threat; it’s water damage that creeps while everything looks fine on the surface.
