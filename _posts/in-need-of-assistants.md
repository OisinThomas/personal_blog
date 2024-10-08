–-
title: "Anyone in Need of Assistants?"
description:  "DevDay for OpenAI brings AI agents to the masses"
updatedAt: "2023-11-07"
publishedAt: "2023-11-07"
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
–-

OpenAI have had a year to remember, with GPT-3, GPT4, vision, text-to-speech, automated speech... and surely they couldn't have more to offer other than minor tweaks of pricing and performance, right? But, they do; and, in many ways I think the latest developments released on their DevDay today are probably the most impactful so far.

If you are impatient like me and want to know the most important changes, skip past the developments and changes and head straight to the GPTs and API Assistants.

### Developments & Changes
There are days' worth of developments and breaking changes:
 - Context length can now reach up to 128k context for GPT-4 turbo (yes, a faster GPT-4 model version!), which is approximately 300 pages of a standard book in English. Additionally, they have made model improvements on attention over long context leading to improved accuracy. I think we will have to explore this a lot over the coming weeks to see how tangible this improvement in accuracy in.
 - Last time I wrote about [function calls](https://www.koukishinousei.com/blog/functional-filtering-with-chatgpt) and the power of determinism in outputs of the model. OpenAI have pushed that a step forward now and now offer JSON formatted responses as an option, rather than a hack. Speaking of function calls, we can now do the thing we wanted to do: be able to call multiple functions at once (looking forward to trying this out for the order of functions).
 - Something you may have noticed particularly with DALLE-3 is that you can now get images to be consistent somewhat more often, allowing you to persist characters across frames. This as is noted in a [Simon Willison blog post](https://simonwillison.net/2023/Oct/26/add-a-walrus/)) is thanks to the seed (thing of as a random number id) that is given to a prompt, which will now allow for more deterministic and reproducible outputs for both images and conversations. I imagine this will help constrain the randomness that higher temperatures can bring to the table, without having to lose the novelty of the chat interaction by reducing it to less than 0.1. Another change that has happened recently is the ability to upload multiple images to GPT-with-vision at once (and not just for the chat interface but for the API too) which will allow for easier prompting for synthesis and extraction of information from images.
 - Another thing announced, but in this case not released yet, are log probs in the API... for those of you don't know, this can be seen as the probability (its log) of how likely it is to come next. It is super useful for debugging the behaviour of your model as you try to get it to produce certain outputs.
 - The onerous issue of the knowledge cut-off being September 2021 has finally been brought forward: for GPT-4 Turbo it is April 2023.
 - If this wasn't enough, we are entering the stage of GPT's having the ability to interact with the world through new modalities – and not just from the chat interface. The new Text-to-speech model (which comes with 6 natural sounding voices), dalle-3 and GPT-4 with vision are all now available from the API which is super exciting to see. One thing I am particularly interested in is now being able to upload multiple images at once to GPT-with-vision. Along with text-to-speech being fully integrated, Whisper V3 (the automated speech recognition model) is now available, and will soon be part of the API also.
 - It is all about the fine-details, and customisability is key with GPT. Fine-tuning is being rolled out for GPT-4. In addition to this, for bigger companies with lots of proprietary data, they will be rolling out custom models which will give companies a close partnership with OpenAI to build tools to suit their needs.
 - And then the expected one: rate limit increases – 2x tokens per minute for all models with control over rate limits from the platform console. They also have developed a tiered system for the rate limits meaning heavier users can more generous rate limits. Additionally, pricing is another strength of the GPT-series, which will continue to look to be the cheapest-in-class way to use high-performance large language models. They make sure of this again by reducing GPT-4 Turbo costs by x3 for inputs and x2 for outputs, and also doing the same for the 16k version of GPT-3.5 Turbo.
 - Interestingly, the mention that improving latency is next on their agenda...

Some of the subtle announcements but big commitments is their commitment through "Copyright Shield" to protecting customers who face legal claims on copyright infringement for those who use ChatGPT Enterprise or the API. This is a massive commitment from the company in the wake of the magnitude of the outcry from professionals from all fields talking about breaking data privacy laws and copyright infringement through the data the model is trained on.

Another subtle change is the removal of the drop-down menu for choosing what plugins to use. They model will now use function calling itself to decide when to use which plugin.

"Everyone gets a GPT" is the zeitgeist of the latter segment of the Opening Keynote with two massive features:

### GPTS
GPTs are tailored versions of ChatGPT for a specific purpose, with instructions, expanded knowledge (think retrieval) and actions (think function calls). And this isn't just for the technically literate, these can be programmed with natural language alone. These can all be run from the ChatGPT interface itself, allowing you to design, plan and play with various APIs and products (like Canva or anything used in Zapier). 

And what's more, they are creating a marketplace with revenue sharing as an incentive for popular GPTs that are shared by users. It will be great to see a place where models can be shared, because up to now, it has felt so restrictive: you had to always build your own, or you ended up in some 3rd party marketplace for prompts etc. This will likely centralise the LLM-community in a way that hasn't been done before.

### Assistants API
These are the first real step by OpenAI into agentive AI. Honestly, they make massive inroads into the development of them, by clearing up issues with state management by using threads to remember conversations, extended capabilities which now allow code-interpreter and function-calling and built-in retrieval – this should solve the problems we had for context windows and chunking.

For anyone who has tried to build an agent in the past, they know it has been tough and required a lot of boutique solutions. Now many of the core backend problems have been removed or greatly reduced in a similar way to how the front-end development and middle-ware was improved by Vercel's AI SDK. Prototyping should become much easier and more rapid than ever with these changes, with a very nifty UI. 

One thing to note is that the maximum number of files that you can use as an extended knowledge base or "retrieval files" is 20. And, currently, it is down (couldn't help but prep a project as soon as it launched).
