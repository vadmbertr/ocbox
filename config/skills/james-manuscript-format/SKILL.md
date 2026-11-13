---
name: james-manuscript-format
description: Formatting and scope requirements specific to submitting a research article to the Journal of Advances in Modeling Earth Systems (JAMES, an AGU journal) — Key Points, Abstract and Plain Language Summary, section structure, Open Research statement, citation style, and JAMES's scope/generalizability bar. Use whenever the user is preparing, formatting, or checking a manuscript for JAMES submission, writing Key Points, writing a Plain Language Summary, or asking things like "does this fit JAMES's scope," "what does JAMES require," "format this for JAMES," "is my paper ready for JAMES."
---

# JAMES Manuscript Format (AGU)

## Scope check — do this first

Before formatting anything, sanity-check scope. JAMES rejects well-written
papers that don't clear this bar, so it's worth catching early:

- The stated suitability measure is whether the paper's results and ideas
  are **generalizable beyond the specifics of the particular study**.
- In scope: work that advances Earth system modeling itself — new or
  improved algorithms/numerical methods; physically-informed or data-driven
  parameterizations and closures (explicitly including ML approaches);
  model coupling advances; new idealizations or model hierarchies; data
  assimilation and state/parameter estimation methods; novel analysis or
  benchmarking methods.
- Out of scope: standalone development, tuning, or evaluation of a
  forecasting system, statistical model, or data-science/ML method without
  a generalizable Earth-system-modeling contribution; pure model
  intercomparison or evaluation papers; stand-alone sensitivity,
  spin-up/initialization, or case-study evaluations; data products without
  a dynamical-modeling component.
- **For an ML paper specifically**: the pitch has to be "this teaches
  something about modeling or understanding the Earth system" (e.g., a
  physically-informed closure, a parameterization that generalizes), not
  "this model scores well on this benchmark." If unsure whether a draft
  clears this, check its Discussion against the `oceanography-ml-writing`
  skill's guidance before formatting proceeds.

## Title

Specific, informative, brief. Any abbreviation used in the title should also
be spelled out the first time it appears in the Abstract.

## Key Points (title page)

- Up to 3 bullet points; at least 1 required.
- Each must be **140 characters or fewer**.
- Complete sentences. No special characters. No acronyms or abbreviations —
  write them out.
- These are the 3 sentences a skimming reader takes away, not a teaser —
  they should summarize the paper's main points and conclusions directly.

## Abstract

- A single paragraph, under 250 words.
- Structure: the problem/gap being addressed → the data or methods used
  (briefly) → the main conclusions and how they're supported → key
  uncertainties.

## Plain Language Summary — required for JAMES

- Its own section, headed "Plain Language Summary," immediately after the
  Abstract.
- A single paragraph, 200 words or fewer.
- Same content as the Abstract, but a different register entirely: no
  jargon, written for a broad audience (journalists, the public, scientists
  outside the field) — this is not a shortened Abstract.

## Body structure

- Starts with an Introduction; the text is divided into sections, each with
  its own heading.
- Suggested progression: Introduction → Materials and Methods (or "Data" if
  that's the more descriptive heading) → Results → Discussion (if used) →
  Conclusions.
- Headings are sentence fragments: capitalize the first letter of every
  word except prepositions, conjunctions, and articles of 3 letters or
  fewer. Never start a heading with a lowercase word or a number.
- Keep the outline balanced — no subsection 2.3.1 without a sibling 2.3.2,
  no lone subsection at a given level.
- No bulleted lists in body text; numbered (enumerated) lists are fine.

## Figures, tables, equations

- Figure captions go below the figure. Spell out any acronym used in a
  caption yourself — don't rely on the publisher's automatic expansion at
  production.
- Table titles/captions go above the table; footnotes go in the table's
  last row.
- Equations: single-line equations are centered and auto-numbered.
  Multi-line equations are left-aligned, broken at an operator (+, -, etc.)
  with continuation lines indented to align under the first character after
  the equals sign.

## Citation style

AGU uses an APA-like author-date style — never numbered or superscript
citations:

- Parenthetical: "...as shown in recent studies (Simpson et al., 2019)."
- Textual: "Simpson et al. (2019) have shown that..."

## End-of-manuscript sections, in this order

1. **Open Research Section** (required) — states exactly where the data and
   software central to the paper's science are archived and openly
   available. "Available from authors," or storing it only in supporting
   information, is not acceptable; archived data/software should be cited
   in the reference list, ideally with a DOI. For an ML paper, this covers
   the training/inference code, model weights if central to reproducing the
   results, and the exact dataset version and access method.
2. **Inclusion in Global Research Statement** (as applicable) — disclose
   permits, local collaborations, or end-users of the research, per AGU's
   authorship-equity policy.
3. **Conflict of Interest declaration** (required) — a real statement, or
   "The authors declare there are no conflicts of interest for this
   manuscript."
4. **Acknowledgments** — funding, colleague thanks, secondary affiliations.
5. **References**.

## Practical notes

- No hard page limit, but page charges apply beyond a nominal length —
  don't pad, but don't self-censor a complete, coherent story either.
- Gold Open Access — all papers are free to read on publication.
- Supplemental material (code samples, images, visualizations) publishes at
  no extra charge, but it does not substitute for the Open Research
  Section's archival requirement above.

## Source

Griffies, S. M., Fan, J., MacBean, N., & Schneider, T. (2023). Aims and
scope of JAMES. *Journal of Advances in Modeling Earth Systems*, 15,
e2023MS003741. doi:10.1029/2023MS003741. AGU author guidelines:
"Summarizing Your Science" (agu.org/publications/authors/Journals/plain-language-summary)
and the official AGU/JAMES manuscript template (agu.org author-resource-center).
