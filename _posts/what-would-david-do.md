---
title: 'The DAVID Framework for AI Evaluations'
description: "A Framework for AI Evals That Actually Works "
publishedAt: '2025-09-27'
updatedAt: '2025-09-27'
author: Oisín Thomas
image: /profile.png
majorTag: Thoughts
subTag: Tech
language: en
available: true
source: Substack
substackUrl: 'https://caideiseach.substack.com/p/what-would-david-do'
tags:
  - ai
  - learning
  - mental-models
---

There's a constant debate online as to the importance of evals/evaluations of AI-generated outputs and where they stand in building value and a moat for a company. I side on their importance: ultimately evals are ways of dealing with uncertainty—this is something decidedly useful both in life and in technology. This is why I was so interested to listen to Lenny's podcast where he interviews [Hamel Husain & Shreya Shankar on the how-tos and importance of evals](https://www.lennysnewsletter.com/p/why-ai-evals-are-the-hottest-new-skill). This little article is meant to boil down the learnings from the podcast (it's nearly two hours long) into something you can consume in under five minutes, building on top of some of my experiences from Weeve and Examfly.

## What would DAVID do?

In the podcast, Hamel and Shreya lay out the steps of moving from a problem in an AI output to improving the outputs. I've personally always been bad at remembering procedures that weren't turned into a mnemonic, so I have reframed it as DAVID:

1. **D**iscover the root causes of the problem.
2. **A**utomate the detection of these in the outputs.
3. **V**alidate your automation against human judgements.
4. **I**mprove the product using your new tools.
5. **D**efend your quality against future regressions.

When you are faced with an AI-output problem, all you've got to ask yourself is: What would DAVID do? Let's break this down together.

## Discover: We Listen, and We Don't Judge (Yet)

The single biggest mistake teams make is trying to guess what's wrong with their AI. We jump straight to solutions, armed with a checklist of problems we think exist. But the first step isn't about judging; it's about listening.

This is the Discover phase, and its core technique is something called open coding. You go directly to your raw data—the actual conversations your users are having with your AI—and you just take notes.

The golden rule here is to capture your raw observations without trying to fit them into boxes.

You're not categorising yet; you're just exploring. When I do this, I often use speech-to-text to make it faster. I'll just look at a user conversation and spew my thoughts out loud: "Okay, the AI completely ignored the second part of the user's question here... and this response sounds really robotic... oh, and it offered a feature we don't even have." These are my open codes—raw, unfiltered, and specific.
This is where the human element is irreplaceable. As Hamel and Shreya pointed out, an LLM can't do this for you because it lacks your business context. It doesn't know your goals or your product's limitations. This manual, human-centric step is where you find the real, unexpected problems that truly matter.

## Automate & Validate: Now We Judge (repeatedly)

After you've collected a hundred or so of these messy notes, you'll start to see patterns. This is where you move from discovery to orientation. You can now use an LLM to help you group your similar open codes into themes. These themes are your Axial codes—the underlying root causes. You might find that twenty different notes about weird phrasing all point to a single Axial code: "Dismissive Tone."

NB: Not all root causes need to be solved with evals—some are simply issues like extra spacing causing issues, broken links etc. Remember to avoid treating Evals as the new Hammer.

Now that you know your biggest problem, it's time to Automate its detection. You build an "LLM as a Judge," a specialised AI whose only job is to look at a conversation and give a simple Pass/Fail verdict on that one specific issue. Is this response dismissive? Yes or No.

But you can't just build a machine and trust it blindly. The next crucial step is to Validate it. You have to test your test. You take a set of conversations you've already labeled yourself and see if your new automated judge agrees with you. This process, comparing the machine's judgment to your own, is how you build a tool you can actually rely on.

Beyond binary classification, I also like to include a comment output so that the AI can create open codes of its own as to why something was a yes or no. In the case that I'm getting a number of false positives or false negatives, it helps me get a better idea of what it sees is wrong, and I can measure it against the open codes that have already been written in the test set.

## Improve & Defend: And Only Now Do We Build

This is where the magic happens. You now have a trusted dashboard of automated gauges that measure the specific things you care about. It's time to go upstream and Improve the actual product.

You can now confidently tweak your main AI agent's prompts/context/workflows, knowing you have a reliable way to measure the impact for these root causes. You make a change, run your new outputs through your validated judges, and check the dashboard. Did the "Dismissive Tone" rate go down? Success!

But fixing one problem can often create another. This is where the final step, Defend, comes in. When you check the impact of your change, you don't just look at the one metric you were trying to improve. You look at all of them. Did your fix for "Tone" accidentally make the AI less factually accurate? Your suite of evals acts as a guardrail, a castle guard that prevents you from taking one step forward and two steps back.

By adopting the D.A.V.I.D. framework, you move from guessing to knowing, from subjective "vibe checks" to a data-driven engine for continuous improvement.

You build a system that not only catches today's problems but also defends the quality of your product for tomorrow. And that is a powerful moat indeed.