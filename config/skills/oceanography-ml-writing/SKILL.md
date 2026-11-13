---
name: oceanography-ml-writing
description: Domain-specific writing guidance for computational oceanography and machine-learning-for-ocean/Earth-system papers — data and methods reporting, section ordering (Methods before Results), baselines, uncertainty, reproducibility, and common ML-in-geoscience pitfalls. Use together with the scientific-writing skill (for sentence/paragraph-level prose) whenever the user is drafting, restructuring, or reviewing a paper, section, or figure about ocean modeling, ocean or climate ML, emulators, parameterizations, or reanalysis-driven prediction. Trigger on requests like "write my methods section for this ocean ML model," "review my results section," "how should I describe my train/test split," "help me frame this parameterization paper," even if the user doesn't say "oceanography" or "machine learning" explicitly.
---

# Computational Oceanography & ML Writing

## How this fits with the scientific-writing skill
Pair this with the `scientific-writing` skill for word/sentence/paragraph-level
craft (jargon, passive voice, topic sentences, tense). This skill covers
structure and content specific to computational oceanography and
ML-for-Earth-system papers, which differs from that skill's generic guidance
in one important way: section order.

## Section order: Methods before Results

The generic skill discusses Results before Methods, following how Plaxco's
essay walks through the elements of a paper. The standard structure in this
field — and the one journals like JAMES structure their templates around —
is IMRaD: **Introduction → Data and Methods → Results → Discussion →
Conclusions**. A reader can't evaluate a result without first knowing the
domain, dataset, and model that produced it, so don't reorder this for
stylistic reasons.

Plaxco's underlying rule still applies inside this ordering, though: the
first Results paragraph should still give the broad-strokes takeaway in
plain terms, so a reader who skipped Methods isn't lost.

## Data and Methods — what belongs here

- Name and version every dataset or product explicitly (e.g., "ERA5,"
  "GLORYS12 reanalysis v1," a specific altimetry product and processing
  level). "Reanalysis data" alone isn't enough for a reviewer to evaluate.
- State the spatial domain, resolution, vertical levels, and time period
  covered. Ambiguity here is one of the most common reviewer complaints in
  ocean-ML papers.
- Describe the train/validation/test split explicitly, and justify the
  strategy for spatiotemporal data. Random point-wise splits leak
  information across space and time in gridded ocean data — prefer splits
  by year, region, or basin, and say so plainly.
- Report preprocessing choices that could change the result if done
  differently: normalization, detrending, land/sea masking, interpolation,
  regridding.
- Describe the model architecture at a level a reader could reimplement
  without the code: layers, loss function, optimizer, key hyperparameters,
  training compute, and number of seeds/runs.
- Describe every baseline compared against, and justify why each is a fair
  comparison (persistence, climatology, a physics-based numerical model, a
  simpler statistical model). A paper that only compares ML models against
  each other, with no non-ML baseline, invites the obvious reviewer
  question.

## Results — what a geoscience reviewer looks for

- Report skill relative to the baselines above, not just absolute error. An
  RMSE without a reference point is close to meaningless to a reviewer.
- Report uncertainty: ensemble spread, confidence intervals, or at minimum
  variability across seeds/folds. A single number with no sense of spread
  reads as unfinished.
- Show spatial and seasonal/regime breakdowns, not only a single
  global/annual metric — averaged skill can hide failure in specific
  basins, seasons, or extreme events, and reviewers will ask if it's
  missing.
- Where physically interpretable, check known physical constraints (mass,
  energy, momentum conservation) and report whether/how the model violates
  them. This is often what separates "a good regression" from a paper that
  teaches something about the ocean.

## Discussion — clear the "generalizable beyond this study" bar

Journals in this space (JAMES explicitly) require the contribution to
generalize beyond the specific model run or dataset used — see the
`james-manuscript-format` skill for the exact scope language. In the
Discussion:

- Tie what the model got right or wrong to a physical mechanism, not just a
  metric.
- State the conditions under which the method should transfer (a different
  basin, resolution, forcing dataset) and be candid about where it likely
  wouldn't.
- If the pitch is efficiency over a physics-based model, address
  computational cost/scalability directly — reviewers will ask if it's
  absent.

## Reproducibility checklist

Expect a revision request if these are missing:

- Code: repository link or DOI, framework and version, hardware used,
  approximate training time/compute cost.
- Data: exact product name, version, source, and access method — not
  "available from authors."
- Random seeds and number of independent training runs, and whether
  reported numbers are a single run or an aggregate.

## Common pitfalls to flag when reviewing a draft

- Spatial or temporal leakage between train and test sets — the single most
  common fatal flaw in ocean-ML papers.
- Comparing only to other ML models, never to a physics-based baseline or
  to climatology/persistence.
- A single aggregate metric with no uncertainty and no regional/seasonal
  breakdown.
- Framing the contribution as "we trained model X and it works" rather than
  what it reveals about ocean or Earth-system processes — for JAMES
  specifically this is a scope mismatch, not just a style weakness.
- Vague or ambiguous domain/resolution/time-period specification in
  Methods.

## Source

Structural framing draws on the Journal of Advances in Modeling Earth
Systems' stated scope and manuscript conventions: Griffies, S. M., Fan, J.,
MacBean, N., & Schneider, T. (2023). Aims and scope of JAMES. *Journal of
Advances in Modeling Earth Systems*, 15, e2023MS003741.
doi:10.1029/2023MS003741; and AGU's standard manuscript template/guidelines.
For prose-level craft, see the `scientific-writing` skill (Plaxco, 2010,
doi:10.1002/pro.514).
