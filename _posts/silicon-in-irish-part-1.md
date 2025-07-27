---
title: "Silicon in Irish (Part 1)"
description: "AI's Unexpected Fluency in Irish"
publishedAt: "2025-05-06T13:02:46.907Z"
updatedAt: "2025-05-06T13:02:46.907Z"
author: "Oisín Thomas"
image: "/profile.png"
majorTag: "Tinkering"
subTag: "Tech"
language: "en"
available: true
source: "Substack"
substackUrl: "https://caideiseach.substack.com/p/silicon-in-irish-part-1"
tags: []
---

One of the persistent questions about large language models like GPT-4 and Claude is how well they handle languages beyond English. We know they're trained predominantly on English text from the internet, with healthy doses of major world languages like Spanish, French, and Chinese. But what about languages with fewer speakers and less online presence?

This question matters because language technology that only works for dominant languages risks further marginalising minority languages and accelerating their decline. If AI can only help you write emails in English but not in Irish, it subtly pushes Irish speakers toward using English in more contexts.


Irish (Gaeilge) makes for a particularly interesting test case. It's a national language with official status, taught in schools across Ireland, yet has only about 72,000 daily speakers. It's also grammatically distant from English, with features that don't map neatly to more common languages.

**The Curious Case of Irish Grammar**
-------------------------------------

If you've never encountered Irish grammar, it's worth appreciating just how different it is from English. Irish has initial mutations where the first letter of a word changes based on grammatical context. The word "_cat_" (which means 'cat') can become "_an c**h**at_" (the cat) or "_a **g**cat_" (their cat) among other declensions, with the pronunciation changing accordingly. Changes at beginnings of words are known as initial mutations, and changes to the end of words are called final mutations, e.g. "ca**i**t" (cats).

Verbs come at the beginning of sentences rather than after the subject. "I see the house" becomes "_Feicim an teach_" (literally "See-I the house"). And there's the autonomous form of verbs, which allows you to say something happened without specifying who did it – similar to passive voice in English but with its own distinct conjugation.

These features make Irish linguistically intriguing, but challenging for language models trained primarily on languages with different structures.

**Building an Irish Grammar Test Suite**
----------------------------------------

To systematically evaluate how well today's AI models handle Irish, I created a comprehensive test suite covering over 20 distinct grammatical features. Each feature includes multiple activities covering various different contexts with specific exercises, totalling over 1,100 individual test items.

The test suite covers everything from basic noun pluralisation to complex verb forms and all in-between:

*   How to form singular and plurals of nouns (turning "baile" (town) into "bailte" (towns)), along with working with different cases (genitive, dative/prepositional, vocative)
    
*   How to form statements in all the tenses (past, present and future) and how to deal with the autonomous verb form
    
*   How to use the conditional mood with "if" clauses
    
*   Along with adjectives, relative pronouns, prepositions and many other features… (see table below in results for major features)
    

For each question, the models needed to produce the correct grammatical form. We had a mix of fill in the blanks (single and multiple instances) as well as whole sentence creation/translation.

**The Models**
--------------

I tested seven leading language models from three providers:

*   Anthropic's Claude 3.5 and 3.7
    
*   OpenAI's GPT-4.1 and GPT-4o
    
*   Google's Gemini 2.0 Flash, Gemini 2.5 Flash, and Gemini 2.5 Pro
    

These represent the current state-of-the-art in general-purpose language models. None were specifically fine-tuned for Irish, so this test evaluates what they've picked up about the language through their general training.

Notably, I tested these with no context other than giving them the question on each occasion. This is so we can analyse what the baseline competencies are of these models.

In a follow-up article, I will work on reasoning models and give their results. But I have excluded reasoning models for this point in time because the general-purpose language models are more suited to simple, single-step tasks, whereas reasoning models have tended to overthink these, leading to a much lower accuracy. In light of the time it takes to get responses and the costs they incur, I have constrained the number of models to just general-purpose LLMs. I will start exploring open-source models at a later date also.

!function(){"use strict";window.addEventListener("message",(function(e){if(void 0!==e.data\["datawrapper-height"\]){var t=document.querySelectorAll("iframe");for(var a in e.data\["datawrapper-height"\])for(var r=0;r<t.length;r++){if(t\[r\].contentWindow===e.source)t\[r\].style.height=e.data\["datawrapper-height"\]\[a\]+"px"}}}))}();

**Where Models Excelled**
-------------------------

The models showed impressive performance in several grammatical areas (_I will likely write up a more detailed model breakdown comparison in the benchmarking on my blog)_:

1.  **Nominative Case (An Tuiseal Ainmneach )**: This section had an 82.2% accuracy rate across all models. This suggests that models have internalised fundamental patterns of Irish noun pluralisation, such as transforming "_ábhar_" (subject/material) to "_ábhair_" (subjects/materials) or "_cathair_" (city) to "_cathracha_" (cities). Even the weakest overall performer (Gemini 2.5 Flash) handled irregular plurals like "_bean_" (woman) → "mná" (women) correctly.
    
2.  **Future Tense (An Aimsir Fháistineach)**: Interestingly, we saw the highest accuracy at 90% here: Claude 3.5, Claude 3.7, and GPT-4o achieving perfect scores. All models correctly formed expressions like "_cuirfidh mé_" (I will put) and "_déanfaidh siad_" (they will do). Even question/negative/dependent future forms like "_an ndéanfaidh tú?_" (will you do?) were handled correctly by all models.
    
3.  **Present Tense (An Aimsir Láithreach)**: Similarly, models demonstrated high accuracy: Claude 3.5 reaching 88.6% and Gemini 2.5 Pro at 85.7%. The regular patterns in present tense conjugation appear well-learned across all models.
    
4.  **Prepositional Pronouns (Na Forainmneacha Réamhfhoclacha)**: General performance on prepositional pronouns (e.g. for him, to her) achieved 81.8% accuracy rate; with Gemini 2.5 Pro leading at 89.1%. All models correctly produced forms like "_agam_" (at me), "_leis_" (with him), and "_uaithi_" (from her). Even the complex form "_eadrainn_" (between us) was correctly produced by all models except Gemini 2.5 Flash.
    
5.  **Verbal Nouns and Verbal Adjectives (An tAinm Briathartha agus an Aidiacht Bhriathartha)**: The average accuracy here was 76.4%—with Claude 3.5 and GPT-4o both exceeding 95%. This suggests models can effectively handle derivational morphology in Irish.
    

What's striking here is that models performed well on grammatical features with consistent patterns. The future tense in Irish follows relatively regular rules, as do basic noun plurals in many cases. This suggests that models can pick up and apply regular patterns even in languages they weren't extensively trained on.

**Where Models Struggled**
--------------------------

The three weakest areas across all models revealed significant challenges:

1.  **The Autonomous Verb Form (An Briathar Saor)**: Unsurprisingly, we had the lowest accuracy here at just 38.3%. This unique verb form, which allows expressing an action without specifying who performed it, confused all models. For example, in one question, all models failed to correctly form "_an ndéantar?_" (is it done?), with most producing "_an ndéanann sé?_" (does he do?) instead. This makes sense when you consider that it is often translated as "_sí_" (she) or "_sé_" (he) in Irish since all nouns have gender, even there references like ‘it’. Even the best performer (Claude 3.5) only reached 45.5% accuracy. This suggests models struggle with grammatical constructions that don't have clear parallels in more common languages. The autonomous form isn't quite passive voice, but it's not active either—it's its own distinctive feature of Irish grammar.
    
2.  **Personal Numbers (Na hUimhreacha Pearsanta)**: These special number forms used with people (e.g., "_beirt_" for "two people" instead of "_dhá_") appear to be challenging for models to master, with the average accuracy being that of a coin-toss.
    
3.  **Past Tense (An Aimsir Chaite)**: Accuracy on past tense questions was less than 50%. This is surprising given that past tense is fundamental in most languages. All models struggled with the negative past form "_níor ith sé_" (he did not eat), often producing "_ní d'ith sé_" (incorrect form). The difficulty likely stems from Irish's irregular past tense forms and initial mutations, which follow patterns that are less predictable than other tenses.
    
4.  **Ordinal Dates (Dátaí na hOrduimhreacha)**: This area had 51.5% accuracy. The specialised forms for expressing dates in Irish appear to be challenging for models to consistently produce correctly. One striking example where almost all models failed was the expression "_an dara hoíche_" (the second night), where most failed to apply h-prefixation to the vowel-initial noun "_oíche_" after "_an dara_".
    

The areas where models struggle most tend to be grammatical features that are uniquely Irish or have complex, interacting rules. The autonomous verb form, for instance, is a distinctive feature without a direct English equivalent. Similarly, personal numbers represent a grammatical concept that doesn't map neatly to English or other major languages—It makes me wonder how it handles more complex and idiosyncratic counting systems like Japanese.

**The Most Interesting Finding: Model Divergence**
--------------------------------------------------

The most striking divergence between models appears in these grammatical features:

1.  **The Genitive Case with Adjectives (An Aidiacht sa Tuiseal Ginideach)**: Claude 3.5 achieved 76.9% while Gemini 2.5 Flash managed only 30.8%. This 46-point gap suggests fundamental differences in how models learned this complex case system. For "cochall an chóta deirg" (the hood of the red coat), Claude 3.5 correctly applied lenition to "dearg" → "deirg", while Gemini 2.5 Flash left it unchanged.
    
2.  **Comparative Adjectives (Céimeanna Comparáide na hAidiachta)**: GPT-4.1 scored 79.3% while Gemini 2.5 Flash scored only 34.5%—a 45-point difference. The rules for forming comparatives in Irish (which involve both suffixes and initial mutations) appear to be better captured by some model architectures than others.
    
3.  **The Genitive Case (An Tuiseal Ginideach)**: GPT-4.1 performed at a solid 78.9% while Gemini 2.5 Flash scored only 37.7%—a 41-point gap. The genitive case, which indicates possession or association, requires complex noun modifications that some models handle much better than others.
    
4.  **Ordinal Dates (Dátaí Na hOrduimhreacha)**: The initial mutations and articles were an issue here. For "_an t-ochtú lá déag_" (the eighteenth day), Claude models maintained the correct form while Gemini models often dropped the article. In another question about "_an chéad bhliain_" (the first year), GPT models correctly applied lenition while Gemini models didn't.
    

Divergences tend to occur in grammatical features that involve multiple transformations—where a word undergoes both a suffix change and an initial mutation. Models that excel at these tasks likely have better representations of hierarchical linguistic rules, while those that struggle may be relying more on memorised patterns without fully capturing the underlying grammar.

Let's look at some concrete examples that illustrate this divergence:

In Genitive Adjectives, GPT-4o correctly applied lenition in "_súil an fhir bhig_" (the eye of the small man) but failed to do so in "_ainm an fhir mór_" (should be "_ainm an fhir mhóir_"—the name of the big man). This inconsistency suggests the model hasn't fully internalised the rule that adjectives must agree with the nouns they modify.

In the Conditional Mood, several models confused "_má_" (if + present/future) and "_dá_" (if + conditional), producing forms like "má bheadh" instead of "dá mbeadh". This indicates difficulty distinguishing between similar conditional structures with different grammatical requirements.

The divergence reveals different "mental models" of Irish grammar. Some models seem to have developed a more systematic understanding of the language's underlying rules, while others appear to rely on pattern matching that breaks down when facing complex interactions between grammatical features.

**The Irish Report Card: Models Score Better Than Expected**
------------------------------------------------------------

!function(){"use strict";window.addEventListener("message",(function(e){if(void 0!==e.data\["datawrapper-height"\]){var t=document.querySelectorAll("iframe");for(var a in e.data\["datawrapper-height"\])for(var r=0;r<t.length;r++){if(t\[r\].contentWindow===e.source)t\[r\].style.height=e.data\["datawrapper-height"\]\[a\]+"px"}}}))}();

Looking at the actual data, the results are quite encouraging:

*   Claude 3.5: 73.08%
    
*   GPT-4.1: 71.81%
    
*   GPT-4o: 70.44%
    
*   Gemini 2.5 Pro: 67.04%
    
*   Claude 3.7: 66.18%
    
*   Gemini 2.0 Flash: 64.31%
    
*   Gemini 2.5 Flash: 51.70%
    

These numbers tell a story that's significantly more positive than I initially expected. Getting 51-73% accuracy on a grammatically complex, low-resource language like Irish without specific fine-tuning is genuinely impressive. For context, these scores would earn a solid passing grade in most Irish language classrooms—they may not mean fluent by any means, but they are demonstrating real competence with the fundamentals.

The provider ranking shows Claude and OpenAI models clustering at the top, with Google's offerings following behind, though the gap isn't dramatic. Most models are performing within about a 10-point range (64-73%), with only Gemini 2.5 Flash falling notably lower.

There is a non-linear progression between model generations. Claude 3.5 outperformed its presumably more advanced successor Claude 3.7 by nearly 7 percentage points. Similarly, Gemini 2.0 Flash scored almost 13 points higher than Gemini 2.5 Flash. This suggests that newer iterations might be optimising for different qualities that don't necessarily translate to better performance on minority languages.

**What This Tells Us About AI and Language**
--------------------------------------------

These results challenge the narrative that AI systems can only handle high-resource languages effectively. Despite Irish representing a tiny fraction of their training data, these models have developed a surprisingly robust grasp of its grammatical structures. This bodes well for the future of AI systems working with minority languages more broadly—[perhaps the digital language divide isn't as insurmountable as we feared](https://oisinthomas.com/blog/ai-shrunk-the-language-divide).

The consistent struggles across all models with certain grammatical features points to fundamental challenges in representing complex morphological transformations. Interestingly, the grammar concepts that stumped AI (autonomous verbs, conditional mood) are often the same ones that challenge human learners.

The performance gap between model families remained consistent across most grammatical features, suggesting systematic differences in training data or architecture rather than random variation.

There's a delightful parallel here with how humans learn languages. We tend to pick up regular patterns first and struggle with exceptions and complex interactions between rules. The models seem to follow a similar path—they've mastered the basics (simple plurals, regular present tense) but struggle with the linguistic equivalent of "[intermediate plateau](https://www.scotthyoung.com/blog/2023/01/03/intermediate-plateau/)" features like the autonomous form or the genitive case with adjectives.

**Why This Matters**
--------------------

The ability of AI to handle minority languages like Irish has implications beyond academic interest:

1.  **Language Preservation**: Better AI support for Irish could help maintain its relevance in the digital age, making it easier for speakers to use their language in modern contexts.
    
2.  **Educational Tools**: AI that understands Irish grammar could power more effective language learning applications, potentially helping reverse the language's decline.
    
3.  **Linguistic Insights**: The patterns of AI success and failure might reveal something about language acquisition more broadly, including which grammatical features are inherently more complex.
    
4.  **AI Development**: Understanding how models handle grammatically distant languages could inform better training methods for future AI systems.
    

There's another dimension here that's worth mentioning again: the performance gap. If AI can handle English with near-human proficiency but struggles with Irish, it creates an incentive structure that subtly rewards using the dominant language. This is the digital equivalent of linguistic hegemony—a process where technology inadvertently reinforces the dominance of major languages. The surprisingly good performance of these models on Irish grammar (51-73% accuracy) offers hope that this gap might be narrower than feared. With targeted improvements, AI could become a tool for language preservation rather than extinction. I'm particularly excited about what can be done moving forward with reasoning models and tooling around AI in order to close this gap.

**The Road Ahead**
------------------

I see this as Phase 1 of a multi-phase plan. We have now asserted the baseline of general-purpose large language models on the Irish language across a breadth of grammatical features. In the coming days, I will work on producing results for OpenAI's reasoning models on the same dataset and fleshing out the comparisons above. One particularly intriguing question is whether providing models with explicit grammatical rules would improve their performance. For instance, would explaining the autonomous verb form before asking models to use it lead to better results? From there, we'll start experimenting with tools and using external data sources to enrich its knowledge.

**N.B.** For the time being, I won't open source this evaluation framework as I work closely on adding more nuanced entries as well as fixing some errors and errata for better and easier evaluating. I want to make sure the models don't get their hands on this data in their next update which would [void much of the work in curating this over the last few weeks](https://www.theregister.com/2025/04/08/meta_llama4_cheating/).

**Conclusion**
--------------

AI isn't fluent in Irish yet, but it's made substantially more progress than many would have expected. With performance ranging from 51-73% accuracy across major models, these systems have clearly picked up significant patterns despite limited exposure to the language.

What's particularly striking is the uneven performance across grammatical features. Models handle some aspects of Irish grammar quite well (future tense, basic plurals) while struggling with others (autonomous verbs, personal numbers). This patchwork competence reveals something about how AI learns language—not as a coherent system of rules but as collections of patterns with varying degrees of regularity.

The non-linear progression between model generations (with Claude 3.5 outperforming Claude 3.7, and Gemini 2.0 Flash beating Gemini 2.5 Flash) suggests that improvements in general capabilities don't always translate to better performance in minority languages. This points to an opportunity for more targeted approaches to enhancing language models' grasp of less-resourced languages.

As these systems continue to evolve, they could become valuable tools for Irish language preservation, education, and accessibility. The journey from basic grammar to fluent Irish conversation is still long for AI, but the first steps are more promising than we might have guessed.

And there's something rather poetic about using the cutting edge of technology to preserve one of Europe's oldest living languages. Perhaps the future of Irish lies partly in silicon after all.  
  
Read [Part Two](https://open.substack.com/pub/caideiseach/p/irish-in-silicon-part-2) here—we are focusing on reasoning models!

_I would like to thank Suhani Chawla for proofreading._

[

![](https://substack-post-media.s3.amazonaws.com/public/images/b152018d-c329-429c-9fea-1bd6e8fa6330_1024x1536.png)



](https://substackcdn.com/image/fetch/$s_!OCN3!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb152018d-c329-429c-9fea-1bd6e8fa6330_1024x1536.png)

