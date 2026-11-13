---
name: scientific-writing
description: Guidelines for writing, editing, and critiquing scientific manuscripts and their individual sections (title, abstract, introduction, results, discussion, methods, figures/captions) for clarity and readability, based on Kevin Plaxco's "The Art of Writing Science" (Protein Science, 2010; doi:10.1002/pro.514). Use this skill whenever the user is drafting, revising, tightening, restructuring, or asking for feedback on any part of a scientific paper, preprint, abstract, or figure caption — even if they don't say "writing style" explicitly, e.g. "help me write my intro," "tighten this paragraph," "is this abstract good," "write a caption for this figure," "review my methods section."
---

# Scientific Writing (after Plaxco, 2010)

## The one rule above all others

The only goal is to make the reader's job as easy as possible. Good writing can't
turn bad science into good science, but it makes good science land. If any
guideline below ever fights against readability, break the guideline.

When reviewing or drafting text, apply the checks in this file, then explain
*why* a change helps (which rule it serves) rather than just rewriting silently
— the user should be able to internalize the rules, not just receive edits.

## Word choice

- Avoid jargon and invented terms. If a common word already covers it, use that
  word instead of coining or borrowing one.
- Avoid abbreviations where possible. If one is necessary, make it mnemonic
  (`kf` for a forward rate constant, not an arbitrary `k1`) so the reader
  doesn't have to keep looking it up. A glossary/definitions table is a last
  resort, not a first move.
- Prefer precise verbs to vague ones. "These data indicate" or "these data
  demonstrate" is more precise than "these data show," which reads as either
  and forces the reader to pause and guess which one you meant.
- Default to present tense for findings that remain true today ("the data
  indicate X causes Y") — it reads as more general and more confident.
  Use past tense for the actual experimental actions ("we measured X using
  Y"), since those happened at a specific point in time. Genuinely one-off
  historical/past events also stay in past tense.

## Sentence craft

- Lead with the actor and the action. Hunt down passive constructions and flip
  them: "Sequences were searched" → "We searched the sequence database."
  Passive voice is common in science writing and reliably duller to read.
- Vary sentence length across a paragraph, but default short. Long sentences
  are one of the strongest predictors of low readability.
- Use parallel grammatical structure for parallel ideas (a list of reasons, a
  sequence of comparable claims). It lets the reader predict the shape of
  what's coming and focus on content instead of parsing.

## Paragraph craft

- Put the point in sentence one. The rest of the paragraph supports that
  sentence; nothing else. Self-test: read only the first sentence of every
  paragraph in a draft — that alone should tell a coherent, complete story.
- One idea per paragraph. If you can't summarize the whole paragraph in a
  single opening sentence, it's actually two paragraphs.
- Make each paragraph stand on its own. Avoid opening a paragraph with
  "However," "In contrast," etc. without restating what's being contrasted —
  don't force the reader to hold the previous paragraph in mind to parse this
  one.
- Every sentence should follow logically from the one before it and set up
  the one after. Don't strip out transition phrases ("Because of this...",
  "This, in turn...") purely to save words — that trims length at the cost of
  flow.

## Section-by-section structure

### Title
- Headline the *finding*, not the *activity*. "Phylogenetic evidence links
  humans and chimps" beats "A phylogenetic analysis of humans and chimps."
- Go as broad as the result honestly supports. Don't narrow the title with a
  specific method/gene/reagent name unless the finding is genuinely specific
  to that detail — an overly specific title shrinks your audience.

### Introduction
- Its only job is to convince the reader the question matters and that an
  answer is coming — not to give away the answer.
- Shape it as an inverted pyramid: broad field → the specific open question →
  what this paper does about it (last paragraph or two).
- Keep it short — 3-4 paragraphs. It is not a literature review; save that
  for the discussion once the reader is already invested.
- Don't spoil the conclusion here. Novelists don't open with the ending;
  neither should you.

### Results
- Open with a paragraph giving the broad-strokes approach in plain terms —
  many readers skip Methods entirely and need this to follow what comes next.
- Every following paragraph: open by stating the question it answers, close
  by stating the answer. This lets a skeptical reader fact-check one
  paragraph — and one logical claim — at a time.
- Brief interpretive asides ("similar to Smith et al., we find...") are fine
  even when there's a separate Discussion section.

### Discussion
- Build it as an upright pyramid: your single most specific conclusion first,
  then widen out to context, limitations, and implications.
- Keep it short — 5-6 paragraphs max.
- Speculation is allowed here, and only here — but flag it explicitly
  ("we speculate that...", "this suggests...").

### Methods
- Assume almost nobody reads this except to check reproducibility. Never make
  the reader go here to understand something needed to follow the Results —
  put that in the Results section itself instead.
- Include everything needed to replicate the work. Unlike the rest of the
  paper, Methods stays in past tense — these are things that were actually
  done at a specific time.

### Figures and captions
- A figure should tell its story just by being looked at — no caption or
  legend required to get the gist. Label lines/panels directly in the image
  rather than in a legend key.
- The first figure ideally conveys the whole paper's goal at a glance (a
  schematic/cartoon often works well for this).
- Write captions so that reading only the captions, in order, reconstructs
  the paper's whole story. The caption's first sentence acts as the figure's
  title.
- In the body text, describe what a figure shows in words, as if the reader
  can't see it, and only append the figure number parenthetically — don't
  write "In Figure 3 we show..." and rely on the reader to go look.

### Abstract
- Draft or revise this *last*, once the paper's real shape is settled.
- It compresses the same context → content → conclusion arc as the whole
  paper: broad field, then the specific gap, then what this paper did
  ("here we..."), then 2-3 sentences of results, then a closing sentence
  (often close to the Discussion's closing line).
- Unlike the Introduction, it's fine — expected, even — to give away the
  ending here. For most readers, this is the only part of the paper they'll
  ever read.

## Self-edit checklist

Run this pass before calling a section (or the whole draft) done:

- [ ] Title states the finding, not the activity, and isn't narrower than the
      result supports
- [ ] Reading only the first sentence of each paragraph in order tells a
      coherent story
- [ ] No paragraph mixes more than one idea
- [ ] Passive constructions found and replaced wherever they bury the actor
- [ ] Abbreviations minimized; any kept are mnemonic, not arbitrary
- [ ] Figures and captions tell the story without needing the body text
- [ ] Abstract was written/revised last, after the paper's shape was known
- [ ] Nothing in the Introduction gives away the conclusion

## Source

Kevin W. Plaxco, "The Art of Writing Science," *Protein Science* 19:2261-2266
(2010). doi:10.1002/pro.514
