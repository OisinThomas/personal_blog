---
title: "Functional Filtering with ChatGPT"
description:  "LLMs still going brrr thanks to timesaving with JSON outputs"
updatedAt: "2023-06-16"
publishedAt: "2023-06-16"
author: "Oisín Thomas"
image: "/profile.png"
majorTag: "Thoughts"
subTag: "Tech"
language: "en"
tags: 
- Tech
- ChatGPT
- OpenAI
- AI
---

Another week, another slew of AI updates. In particular, this week has seen a very exciting new development from OpenAI: function calling. Their post about it was [rather uninspiring](https://platform.openai.com/docs/guides/gpt/function-calling), so I wanted to give it a closer look and show you why it came about, why it matters, and how it is really useful.

## Up to Now

Chat completions using OpenAI have taken the world by storm, with "Ask GPT" trending on Twitter and much fear and excitement for what LLMs will mean for the world of work—especially in the realm of content creation. And, that isn't really surprising because, up to now, the most obvious use cases for the chat models have been that: conversation and content media creation.

The reach of the technology stepped forward with the advent of ChatGPT plugins—allowing it to access the web from within the scope of the chat window for the first time, and not just through the developer's API.

## The Information to Noise Ratio

But, a large problem remained: it is very difficult to extract information from a conversation and these Chat models were rather fallible when it came to extracting key pieces of information from text in a predictable way.

An early fix for this was asking the model to respond in JSON format which is common across the internet itself, basically key-value pairs. For example:

```json
{
  "mood": "happy",
  "model-details": {
    "initialized": "today",
    "name": "gpt"
  }
}
```

OpenAI, as much as admitted this when they said that ChatGPT-3.5 didn't pay enough attention to the system message (where you define much of what you want the model to respond like), which meant that the above solution was still hit-or-miss. The result of this was clear in how much extra research and development time developers would spend fine-tuning prompts and writing parsing code in order to get a response to return in a (semi) predictable fashion after they got the response they wanted.

Solving this problem became crucial in allowing programmers to integrate these models into existing technologies: because ultimately software is built around defined and deterministic structures—even when the choices made inside the structures are anything but deterministic.

Function Calling: A Better Filter
Enter function calling with the latest fine-tuning of the chat models. OpenAI did indeed greatly improve on the deficiency of the previous iterations, with the function playing the part of the system message: "Under the hood, functions are injected into the system message in a syntax the model has been trained on." And, in truth, a better name for it may be a filter rather than a function because it is reducing the noise of the output and allows you to consistently and predictably extract or generate features from input data.

For example, say you have a large article and you want to find out the major themes, characters, dates, and events that are mentioned in it. Before, you could ask Chat to do that and you would get back paragraphs of text, or perhaps with a little prompt-engineering, come away with a couple lines of text. At worst, if the text was very long you might have to prompt it for each answer separately. Not bad, especially if it is a once-off job. But it becomes rather difficult to do this at scale—you have multiple potential breakpoints: maybe you were extracting words using regex and it returns it differently 30% of the time, or perhaps it returns it as a numbered list instead of bullet points. And let's not forget the costs of all this extraneous text…

Moving towards Determinism
But now, machine readability is put to the fore—saving both time in development and cutting costs in production. You can define what you want returned in parameters—a name, a description (perhaps with an example) and a type—and, yes, as the docs admit, it may generate invalid JSON or hallucinate parameters, but at the very least you have a defined structure: the cornerstone of a programmable system.

What is even more interesting is that a conversation can pass multiple functions (potential filters), and the model can choose which one to apply. You are only really limited by the context window. If one of them applies, it will return the stringified JSON answer that you specified in the function setup, which you can pass on to another API (like the weather API, or Amazon for shopping, or your own models, or into a database, etc.); and, if none apply, it will respond with a normal conversational response. As an aside, I am very curious as to what they are using to figure out what function to apply on an input text, but I feel that's another conversation…

This was the missing piece of the puzzle for developing with OpenAI's chat models in the wild beyond the myriad of implementations document summarization and chat bots towards more agentive systems—one's that communicate with each other or with themselves. I highly advise you to check out this video on [Function Calling](https://www.youtube.com/watch?v=0lOSvOoF2to) by sentdex for some fun examples and a nice notebook to play with.

Along with this feature being available for gpt4 also, increased context window size (16k for gpt-3.5!) and with gpt-3.5-turbo 25% cheaper, I expect to see the integration of LLMs accelerate across the tech space.

```json
{
“Title”: “Functional Filtering with ChatGPT”
“Summary”: “LLMs still going brrr thanks to timesaving with JSON outputs”,
}
```