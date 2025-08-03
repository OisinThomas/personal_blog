---
title: an ode to code
description: 'programming languages >> natural languages '
publishedAt: '2024-11-27T23:04:44.529Z'
updatedAt: '2024-11-27T23:04:44.529Z'
author: Oisín Thomas
image: /profile.png
majorTag: Thoughts
subTag: Tech
language: en
available: true
source: Substack
substackUrl: 'https://caideiseach.substack.com/p/an-ode-to-code'
tags:
  - code
  - llms
  - ai
---

<a href="https://x.com/simonw/status/1861563015394664498">

![](https://substack-post-media.s3.amazonaws.com/public/images/0ed2fb5a-91d2-4f0a-8870-37c3ba8a91bc_1200x576.png)
</a>

The more you can convert to code the better right now. Code is the language that LLMs are best at producing right now in a meaningful way, which makes me bullish on translating as many problems to code as possible.

The increments in accuracy can be subtle, but they are compounding quickly. You can see that code-completions are becoming more and more accurate across time, and reports have come out that [over 25% of Google’s code is now written by AI](https://fortune.com/2024/10/30/googles-code-ai-sundar-pichai/). Yes, at one of the smartest organisations in the world, 25% of their code can be written using generative AI. It makes me wonder how much progress could be made in other fields where code is not traditionally used?


<a href="https://aider.chat/assets/models-over-time.svg">

![](https://substack-post-media.s3.amazonaws.com/public/images/0dbb2ede-1789-4bce-ab76-cdac6f1a3bb8_1936x1272.png)

</a>

The answer to this question is a glass half-full in my view: The usage numbers of generative AI are still extremely low across most industries. This graph from [Ben Evan’s ‘AI Eats the World’](https://www.ben-evans.com/presentations) of employed people across industries who use generative AI shows that it may be in the media every day, but it isn’t anywhere close to full market penetration. Why I see this as half-full is because it means that there are still so many opportunities out there to build amazing solutions for problems that haven’t been tested against the latest capabilities of software.

<a href="https://www.ben-evans.com/presentations">

![](https://substack-post-media.s3.amazonaws.com/public/images/10aea391-70f1-4b0c-8b47-9ee53ac7bb39_873x408.png)

</a>

I think one of the primary limiting factors in why usage is not more pervasive is the code-illiteracy in most fields. [There is an estimated 0.5% of the world population who know how to code](https://blog.stephsmith.io/learning-to-code-apps) (though the real figure is unknown and this statistic is somewhat apocryphal). As a side-effect of this, most people will only ever think of engaging in a problem using natural language (and expecting the model to do all kind of logic gymnastics in words alone), which ultimately results in poor results and people thinking LLMs aren’t anything more than a questionable Google search.

I mentioned in a previous article about how [LLMs infamously struggled to add or count the number of r’s in strawberry](https://caideiseach.substack.com/p/the-kaleidoscope-hypothesis-for-education?r=3v9fhz). François Chollet put this down to a lack of abstraction ability in the models to be able to come up with generalisable functions for counting etc.. But we _can_ shortcut this using code. Simply asking any LLM to create a function in Python or your favourite programming language to add two numbers or take a string and find the number of r’s in it is trivial. It has the general mental models encoded in a different language — in this case programming languages — because humans have had to work hard to encapsulate abstractions like this in a formal language. This is not to say that LLMs are intelligent or can generalise, but it an attempt to point out that sometimes the approach is what matters most.

The problem of being able to synthesise and abstract is still an issue — [LLMs won’t be writing math proofs just yet](https://www.scientificamerican.com/article/ai-will-become-mathematicians-co-pilot); but, if you try translate your problem that seems intractable in natural language to code, we might be able to get some more problems unstuck.
