---
title: 'Mines and Rabbit Holes #2'
description: 'Welcome to Mines and Rabbit Holes #2. It is great to say that there is indeed a follow up and I hope you enjoy!'
publishedAt: '2025-08-31'
updatedAt: '2025-08-31'
author: Oisín Thomas
image: /profile.png
majorTag: Thoughts
subTag: Tech
language: en
available: true
source: Substack
substackUrl: https://open.substack.com/pub/caideiseach/p/mines-and-rabbit-holes-61d
tags:
  - ai
  - antifragile
  - learning
  - technology
---

Welcome to Mines and Rabbit Holes #2. It is great to say that there is indeed a follow-up and I hope you enjoy!

Speaking of mines...

## Anti-AI or Canaries in the Coal Mine

Lately, in the news and in the blogosphere, there has been a lot more anti-AI sentiment—[the rise of clanker](https://www.instagram.com/p/DMq9VpRPmv3/), a mix of some [true tragedies](https://www.bbc.com/news/articles/cgerwp7rdlvo), underwhelming model releases with [GPT 5](https://x.com/sama/status/1953953990372471148), absurdly good model releases with [Nano Banana](https://gemini.google/overview/image-generation/) that feel like they are threatening the compositing profession, and new reports on the efficacy of AI projects.

MIT recently released [a paper](https://mlq.ai/media/quarterly_decks/v0.1_State_of_AI_in_Business_2025_Report.pdf) saying that 95% of AI pilots are failing whilst Stanford released [a paper](https://digitaleconomy.stanford.edu/wp-content/uploads/2025/08/Canaries_BrynjolfssonChandarChen.pdf) stating since 2022, workers aged 22–25 in high-AI-exposure jobs—like accounting, software development, and customer service—have seen a notable drop in hiring (-13%).

I think there are issues with both papers, particularly the Stanford release—at least a confusion of causation and correlation:

- Hiring slowdowns in late 2022–2023 line up more with post-COVID tech layoffs and macroeconomic contraction than with AI adoption.
- The SWE benchmark was created in 2023, so understandably it was low; also we have a lot of training leakage and Goodhart law-ism.

I wonder:

1) why it isn't measuring outsourced work more (which arguably tends to be more amenable to automation) and
2) let's be very fair... no one was replacing people with AI in 2022/2023, and these large firms that would be hiring weren't really moving past POC until 2024. And let's not forget the MIT paper states that 95% of pilots are failing...

But we can consider this paper a canary in the coal mine - this is the first time a paper released on the topic is being widely believed, and it sounds like we are [moving in this direction](https://danielmiessler.com/blog/im-worried-it-might-get-bad).

![presidents](/presidents.png)
I'll leave it to the discretion of my eagle-eyed readers to figure out what's wrong with both of these AI images (created using GPT5). This is surprisingly better than the generation of the American presence that went viral on X.

## The Product Era of 💅

Despite my recent article ["AI and Mental Masturbation"](https://oisinthomas.com/blog/ai-and-mental-masturbation) and the model's patchy ability to produce all the Irish Presidents (based on [Gary Marcus' post](https://garymarcus.substack.com/p/llms-are-not-like-you-and-meand-never)), I am still quite tech-positive and overall, I'm very optimistic about what we can use this technology for: even if the models slow down and we don't [achieve true thinking in the way that Kenneth Stanley talks about, and we're left with this fractal AGI](https://www.youtube.com/watch?v=KKUKikuV58o), there are still so many things we can build and do and ameliorate.

I am a longtime subscriber to Daniel Miessler's blog, it is truly a high-alpha technical blog. I've been very excited to work through his articles lately, describing his personal AI assistant, and I've been in the process of building my own. Ultimately, for many tasks, we do have [functional AGI](https://danielmiessler.com/blog/functional-technical-agi) right now and if we make the best out of it, we can turn into [AI solution factories](https://danielmiessler.com/blog/ai-solution-factories).

If you are looking for some predictions about the future, Andrew Ng has been rather correct in the past, and [perhaps he will be correct again](https://x.com/karlmehta/status/1959242981921497093/?s=12&t=NE47QyofSrgF_BX00o9_sA&rw_tt_thread=True). Because one thing we know is [the fraction of work that humans can actually complete is very small relative to all the work that can possibly be done. AI will indeed amplify the amount of work we can do, and it's all how we use it.](https://danielmiessler.com/blog/ai-workforce-volume-difficulty-curve)

And there is now a framework to start understanding how these products and techniques can be measured:

>[!quote] The KISAC Framework: Measuring Intelligence Task Performance
> To understand why AI can expand both dimensions so dramatically, consider what makes someone good at Intelligence Tasks:
>
> - 📘 Knowledge — All the information, training, and experience
> - 🧠 Intelligence — Ability to find patterns and generate insights
> - 🕰️ Speed — How many tasks completed per time period
> - 🔎 Accuracy — Correctness and error rates
> - 💶 Cost — Total expense to employ and maintain
>
> ——[The Area Under the Curve How AI Expands Human Work Capacity](https://danielmiessler.com/blog/ai-workforce-volume-difficulty-curve)

## The Shape of The System and Antifragile Processes

>[!quote] Antifragile orgs don’t treat documentation as a chore. They capture expertise as a byproduct of real work:
> - **Automatic ingestion**: AI parses Slack, tickets, PRs — no extra keystrokes required.
> - **A living knowledge graph**: Concepts connect across systems. Gaps surface automatically.
> - **Feedback loops**: Every solved ticket updates the system. Answers get smarter over time.
> — [Your Top Engineer Just Gave Notice](https://www.runllm.com/blog/build-engineering-team-resilience)

One of my favourite concepts that I've ever come across is antifragility as coined by Nassim Taleb in [Antifragile](https://www.amazon.co.uk/Antifragile-Things-that-Gain-Disorder/dp/0141038225): something which benefits from disorder. As I previously wrote, ["Train the model; train your team"](https://caideiseach.substack.com/p/train-the-model-train-the-team?r=3v9fhz) the imperative is now to track and elucidate processes in order to offload as much as possible to AI. In doing so, we are also building more robust and potentially antifragile teams.

To really get the best out of these systems, we have to realise that we're dealing with unstructured data mostly: we still have to get it into structured formats in order to make use of them in our more deterministic systems. Anson Yu writes a very interesting article about how to [structure your system to allow for AI agents](https://anson.substack.com/p/how-to-design-systems-for-agents) and uses education's favourite structure known as Bloom's Taxonomy to do so. I think there's still a lot of work to be done on taking the unstructured output and generating structured outputs... Pydantic and Zod or other typing layers go a long way, but to be able to ask for specific outputs without affecting the quality of the model by virtue of putting those handcuffs on it [are still something that hasn't been fully addressed](https://x.com/karpathy/status/1930354382106964079/?s=12&t=NE47QyofSrgF_BX00o9_sA&rw_tt_thread=True).

## Cúinne na Gaeilge

I'm always looking for some new bloggers to read in Irish. Recently, I translated into Irish a new Paul Graham article on [the shape of essay field](https://oisinthomas.com/blog/reimse-scribhneoireacht-na-naisti), and also wrote a piece on how to translate—or not translate—[Clanker](https://oisinthomas.com/blog/clanker).

---

It can't be stated enough that one of the most important things you can do in life is to think deeply, and it is the goal of Mines and Rabbit Holes to really help me consolidate and review what I've been thinking deeply about in the last couple of weeks. In many ways, this (irregular) periodic is putting together ["thinking more quickly"](https://caideiseach.substack.com/p/thinking-more-faster?r=3v9fhz) and ["curiosity and the compression imperative"](https://caideiseach.substack.com/p/the-compression-imperative?r=3v9fhz). On any of the points above, I welcome any feedback, critiques, or further links. Because it's not just the models that need to grow smarter, we need to also :]
